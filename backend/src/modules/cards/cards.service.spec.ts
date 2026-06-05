import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CardsService } from './cards.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  deck: { findFirst: jest.fn() },
  card: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CardsService', () => {
  let service: CardsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CardsService>(CardsService);
  });

  describe('findAll', () => {
    it('returns cards for a valid deck', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.card.findMany.mockResolvedValue([{ id: 1, front: 'Q', back: 'A' }]);
      const result = await service.findAll(1, 'client-1');
      expect(result).toHaveLength(1);
    });

    it('throws NotFoundException when deck not found', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue(null);
      await expect(service.findAll(1, 'client-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a card in an owned deck', async () => {
      const deck = { id: 1, isPreloaded: false };
      const card = { id: 1, front: 'Q', back: 'A', deckId: 1 };
      mockPrisma.deck.findFirst.mockResolvedValue(deck);
      mockPrisma.card.create.mockResolvedValue(card);
      const result = await service.create(1, { front: 'Q', back: 'A' }, 'client-1');
      expect(result).toEqual(card);
    });

    it('throws NotFoundException when deck not found', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue(null);
      await expect(service.create(1, { front: 'Q', back: 'A' }, 'client-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for preloaded deck', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue({ id: 1, isPreloaded: true });
      await expect(service.create(1, { front: 'Q', back: 'A' }, 'client-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('updates a card in an owned deck', async () => {
      const card = { id: 1, clientId: 'client-1', deck: { isPreloaded: false } };
      mockPrisma.card.findFirst.mockResolvedValue(card);
      mockPrisma.card.update.mockResolvedValue({ ...card, front: 'New Q' });
      const result = await service.update(1, { front: 'New Q' }, 'client-1');
      expect(result).toHaveProperty('front', 'New Q');
    });

    it('throws NotFoundException when card not found', async () => {
      mockPrisma.card.findFirst.mockResolvedValue(null);
      await expect(service.update(1, {}, 'client-1')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when card belongs to different client', async () => {
      const card = { id: 1, clientId: 'other', deck: { isPreloaded: false } };
      mockPrisma.card.findFirst.mockResolvedValue(card);
      await expect(service.update(1, {}, 'client-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for preloaded deck', async () => {
      const card = { id: 1, clientId: 'client-1', deck: { isPreloaded: true } };
      mockPrisma.card.findFirst.mockResolvedValue(card);
      await expect(service.update(1, {}, 'client-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deletes a card from an owned deck', async () => {
      const card = { id: 1, clientId: 'client-1', deck: { isPreloaded: false } };
      mockPrisma.card.findFirst.mockResolvedValue(card);
      mockPrisma.card.delete.mockResolvedValue(card);
      await service.remove(1, 'client-1');
      expect(mockPrisma.card.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws NotFoundException when card not found', async () => {
      mockPrisma.card.findFirst.mockResolvedValue(null);
      await expect(service.remove(1, 'client-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for preloaded deck', async () => {
      const card = { id: 1, clientId: 'client-1', deck: { isPreloaded: true } };
      mockPrisma.card.findFirst.mockResolvedValue(card);
      await expect(service.remove(1, 'client-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
