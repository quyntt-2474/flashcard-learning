import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  private async withCounts(deck: { id: number; [key: string]: unknown }) {
    const now = new Date();
    const [cardCount, dueCount, masteredCount] = await Promise.all([
      this.prisma.card.count({ where: { deckId: deck.id } }),
      this.prisma.card.count({
        where: { deckId: deck.id, dueDate: { lte: now } },
      }),
      this.prisma.card.count({ where: { deckId: deck.id, isMastered: true } }),
    ]);
    return { ...deck, cardCount, dueCount, masteredCount };
  }

  async findAll(clientId: string, categoryId?: number) {
    const decks = await this.prisma.deck.findMany({
      where: {
        AND: [
          categoryId ? { categoryId } : {},
          { OR: [{ clientId }, { isPreloaded: true }] },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
    return Promise.all(decks.map((d) => this.withCounts(d)));
  }

  async findOne(id: number, clientId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: { id, OR: [{ clientId }, { isPreloaded: true }] },
    });
    if (!deck) throw new NotFoundException('Deck not found');
    return this.withCounts(deck);
  }

  async create(dto: CreateDeckDto, clientId: string) {
    const deck = await this.prisma.deck.create({
      data: { ...dto, clientId, isPreloaded: false },
    });
    return this.withCounts(deck);
  }

  async update(id: number, dto: UpdateDeckDto, clientId: string) {
    const deck = await this.prisma.deck.findFirst({ where: { id, clientId } });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.isPreloaded)
      throw new ForbiddenException('Cannot modify a pre-loaded deck');
    const updated = await this.prisma.deck.update({ where: { id }, data: dto });
    return this.withCounts(updated);
  }

  async remove(id: number, clientId: string) {
    const deck = await this.prisma.deck.findFirst({ where: { id, clientId } });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.isPreloaded)
      throw new ForbiddenException('Cannot delete a pre-loaded deck');
    await this.prisma.deck.delete({ where: { id } });
  }
}
