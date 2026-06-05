import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  category: { findMany: jest.fn() },
  deck: { findMany: jest.fn(), count: jest.fn() },
  card: { count: jest.fn() },
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('findAll', () => {
    it('returns categories with deck count', async () => {
      mockPrisma.category.findMany.mockResolvedValue([{ id: 1, name: 'A1' }]);
      mockPrisma.deck.count.mockResolvedValue(3);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('deckCount', 3);
    });

    it('returns empty array when no categories', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findDecksInCategory', () => {
    it('returns decks with cardCount and dueCount', async () => {
      const decks = [{ id: 1, name: 'Deck 1' }];
      mockPrisma.deck.findMany.mockResolvedValue(decks);
      mockPrisma.card.count.mockResolvedValue(10);
      const result = await service.findDecksInCategory(1, 'client-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('cardCount', 10);
      expect(result[0]).toHaveProperty('dueCount', 10);
    });

    it('returns empty array when no decks in category', async () => {
      mockPrisma.deck.findMany.mockResolvedValue([]);
      const result = await service.findDecksInCategory(1, 'client-1');
      expect(result).toEqual([]);
    });
  });
});
