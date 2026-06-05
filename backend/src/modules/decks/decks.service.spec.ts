import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DecksService } from './decks.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  deck: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  card: { count: jest.fn() },
};

describe('DecksService', () => {
  let service: DecksService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.card.count.mockResolvedValue(0);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DecksService>(DecksService);
  });

  describe('findAll', () => {
    it('returns decks with card counts', async () => {
      mockPrisma.deck.findMany.mockResolvedValue([{ id: 1, name: 'Test' }]);
      mockPrisma.card.count.mockResolvedValue(5);
      const result = await service.findAll('client-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('cardCount', 5);
    });

    it('returns decks filtered by categoryId', async () => {
      mockPrisma.deck.findMany.mockResolvedValue([]);
      const result = await service.findAll('client-1', 2);
      expect(result).toEqual([]);
      expect(mockPrisma.deck.findMany).toHaveBeenCalled();
    });

    it('returns empty array when no decks', async () => {
      mockPrisma.deck.findMany.mockResolvedValue([]);
      const result = await service.findAll('client-1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns deck with card counts', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue({ id: 1, name: 'Test' });
      mockPrisma.card.count.mockResolvedValue(3);
      const result = await service.findOne(1, 'client-1');
      expect(result).toHaveProperty('cardCount', 3);
      expect(result).toHaveProperty('dueCount');
      expect(result).toHaveProperty('masteredCount');
    });

    it('throws NotFoundException when deck not found', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue(null);
      await expect(service.findOne(1, 'client-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates deck and returns with counts', async () => {
      const deck = {
        id: 1,
        name: 'New',
        clientId: 'client-1',
        isPreloaded: false,
      };
      mockPrisma.deck.create.mockResolvedValue(deck);
      const result = await service.create(
        { title: 'New', categoryId: 1 },
        'client-1',
      );
      expect(result).toHaveProperty('cardCount', 0);
    });
  });

  describe('update', () => {
    it('updates deck and returns with counts', async () => {
      const deck = { id: 1, title: 'Old', isPreloaded: false };
      mockPrisma.deck.findFirst.mockResolvedValue(deck);
      mockPrisma.deck.update.mockResolvedValue({ ...deck, title: 'New' });
      const result = await service.update(1, { title: 'New' }, 'client-1');
      expect(result).toHaveProperty('title', 'New');
      expect(result).toHaveProperty('cardCount');
    });

    it('throws NotFoundException when deck not found', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue(null);
      await expect(service.update(1, {}, 'client-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException for preloaded deck', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue({ id: 1, isPreloaded: true });
      await expect(service.update(1, {}, 'client-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('removes deck', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue({
        id: 1,
        isPreloaded: false,
      });
      mockPrisma.deck.delete.mockResolvedValue({ id: 1 });
      await service.remove(1, 'client-1');
      expect(mockPrisma.deck.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws NotFoundException when deck not found', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue(null);
      await expect(service.remove(1, 'client-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException for preloaded deck', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue({ id: 1, isPreloaded: true });
      await expect(service.remove(1, 'client-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
