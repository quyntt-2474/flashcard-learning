import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    const result = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        deckCount: await this.prisma.deck.count({
          where: { categoryId: cat.id },
        }),
      })),
    );
    return result;
  }

  async findDecksInCategory(categoryId: number, clientId: string) {
    const decks = await this.prisma.deck.findMany({
      where: {
        categoryId,
        OR: [{ clientId }, { isPreloaded: true }],
      },
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();
    return Promise.all(
      decks.map(async (deck) => ({
        ...deck,
        cardCount: await this.prisma.card.count({ where: { deckId: deck.id } }),
        dueCount: await this.prisma.card.count({
          where: { deckId: deck.id, dueDate: { lte: now } },
        }),
      })),
    );
  }
}
