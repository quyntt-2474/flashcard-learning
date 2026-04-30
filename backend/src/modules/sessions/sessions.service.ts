import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Sm2Service } from '../../core/sm2/sm2.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sm2: Sm2Service,
  ) {}

  async create(dto: CreateSessionDto, clientId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: {
        id: dto.deckId,
        OR: [{ clientId }, { isPreloaded: true }],
      },
    });
    if (!deck) throw new NotFoundException('Deck not found');

    const now = new Date();
    const dueCards = await this.prisma.card.findMany({
      where: { deckId: dto.deckId, dueDate: { lte: now } },
      orderBy: { dueDate: 'asc' },
      select: { id: true, front: true, back: true, dueDate: true },
    });

    if (dueCards.length === 0) {
      const nextCard = await this.prisma.card.findFirst({
        where: { deckId: dto.deckId },
        orderBy: { dueDate: 'asc' },
      });
      throw new UnprocessableEntityException({
        message: 'No cards are due for review today',
        nextDueDate: nextCard?.dueDate ?? null,
      });
    }

    const session = await this.prisma.studySession.create({
      data: { deckId: dto.deckId, clientId },
    });

    return { ...session, dueCards };
  }

  async findOne(id: number, clientId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: { id, clientId },
      include: {
        reviews: {
          select: {
            cardId: true,
            grade: true,
            reviewedAt: true,
            newDueDate: true,
          },
        },
        deck: {
          select: {
            id: true,
            cards: {
              select: { id: true, front: true, back: true, dueDate: true },
            },
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    const totalDue = await this.prisma.card.count({
      where: { deckId: session.deckId, dueDate: { lte: session.startedAt } },
    });

    const { deck, ...res } = session;

    return {
      ...res,
      reviewedCount: session.reviews.length,
      totalDue,
      cards: deck.cards,
    };
  }

  async submitReview(
    sessionId: number,
    dto: SubmitReviewDto,
    clientId: string,
  ) {
    const session = await this.prisma.studySession.findFirst({
      where: { id: sessionId, clientId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.completedAt)
      throw new BadRequestException('Session already completed');

    const card = await this.prisma.card.findUnique({
      where: { id: dto.cardId },
    });
    if (!card) throw new NotFoundException('Card not found');

    const result = this.sm2.calculate({
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      grade: dto.grade,
    });

    await this.prisma.$transaction([
      this.prisma.card.update({
        where: { id: dto.cardId },
        data: {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          dueDate: result.dueDate,
          isMastered: result.isMastered,
        },
      }),
      this.prisma.cardReview.create({
        data: {
          cardId: dto.cardId,
          sessionId,
          grade: dto.grade,
          newDueDate: result.dueDate,
        },
      }),
    ]);

    return {
      cardId: dto.cardId,
      grade: dto.grade,
      newDueDate: result.dueDate,
      newInterval: result.interval,
      newEaseFactor: result.easeFactor,
      newRepetitions: result.repetitions,
      isMastered: result.isMastered,
    };
  }

  async complete(sessionId: number, clientId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: { id: sessionId, clientId },
      include: { reviews: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    const completedAt = new Date();
    await this.prisma.studySession.update({
      where: { id: sessionId },
      data: { completedAt },
    });

    const counts = { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 };
    for (const r of session.reviews) counts[r.grade]++;

    const correct = counts.GOOD + counts.EASY;
    const total = session.reviews.length;
    const accuracyPercent = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      id: sessionId,
      completedAt,
      totalCards: total,
      again: counts.AGAIN,
      hard: counts.HARD,
      good: counts.GOOD,
      easy: counts.EASY,
      accuracyPercent,
    };
  }
}
