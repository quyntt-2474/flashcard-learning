import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(deckId: number, clientId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, OR: [{ clientId }, { isPreloaded: true }] },
    });
    if (!deck) throw new NotFoundException('Deck not found');
    return this.prisma.card.findMany({
      where: { deckId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(deckId: number, dto: CreateCardDto, clientId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, clientId },
    });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.isPreloaded)
      throw new ForbiddenException('Cannot add cards to a pre-loaded deck');
    return this.prisma.card.create({
      data: { ...dto, deckId, clientId, dueDate: new Date() },
    });
  }

  async update(id: number, dto: UpdateCardDto, clientId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id },
      include: { deck: true },
    });
    if (!card || card.clientId !== clientId)
      throw new NotFoundException('Card not found');
    if (card.deck.isPreloaded)
      throw new ForbiddenException('Cannot edit cards in a pre-loaded deck');
    return this.prisma.card.update({ where: { id }, data: dto });
  }

  async remove(id: number, clientId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id },
      include: { deck: true },
    });
    if (!card || card.clientId !== clientId)
      throw new NotFoundException('Card not found');
    if (card.deck.isPreloaded)
      throw new ForbiddenException(
        'Cannot delete cards from a pre-loaded deck',
      );
    await this.prisma.card.delete({ where: { id } });
  }
}
