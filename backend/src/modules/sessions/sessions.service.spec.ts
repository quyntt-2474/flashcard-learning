import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Sm2Service } from '../../core/sm2/sm2.service';
import { GradeEnum } from './dto/submit-review.dto';

const mockPrisma = {
  deck: { findFirst: jest.fn() },
  card: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  studySession: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  cardReview: { create: jest.fn() },
  $transaction: jest.fn(),
};

const mockSm2 = { calculate: jest.fn() };

describe('SessionsService', () => {
  let service: SessionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: Sm2Service, useValue: mockSm2 },
      ],
    }).compile();
    service = module.get<SessionsService>(SessionsService);
  });

  describe('create', () => {
    it('creates a session with due cards', async () => {
      const dueCards = [{ id: 1, front: 'Q', back: 'A', dueDate: new Date() }];
      mockPrisma.deck.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.card.findMany.mockResolvedValue(dueCards);
      mockPrisma.studySession.create.mockResolvedValue({ id: 1, deckId: 1, clientId: 'c1' });
      const result = await service.create({ deckId: 1 }, 'c1');
      expect(result).toHaveProperty('dueCards', dueCards);
      expect(result.id).toBe(1);
    });

    it('throws NotFoundException when deck not found', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue(null);
      await expect(service.create({ deckId: 1 }, 'c1')).rejects.toThrow(NotFoundException);
    });

    it('throws UnprocessableEntityException when no due cards (no next card)', async () => {
      mockPrisma.deck.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.card.findMany.mockResolvedValue([]);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      await expect(service.create({ deckId: 1 }, 'c1')).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws UnprocessableEntityException when no due cards (with next card)', async () => {
      const nextDue = new Date(Date.now() + 86400000);
      mockPrisma.deck.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.card.findMany.mockResolvedValue([]);
      mockPrisma.card.findFirst.mockResolvedValue({ dueDate: nextDue });
      await expect(service.create({ deckId: 1 }, 'c1')).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('findOne', () => {
    it('returns session details with counts', async () => {
      const session = {
        id: 1,
        deckId: 1,
        startedAt: new Date(),
        reviews: [{ cardId: 1, grade: 'GOOD', reviewedAt: new Date(), newDueDate: new Date() }],
        deck: { id: 1, cards: [{ id: 1, front: 'Q', back: 'A', dueDate: new Date() }] },
      };
      mockPrisma.studySession.findFirst.mockResolvedValue(session);
      mockPrisma.card.count.mockResolvedValue(3);
      const result = await service.findOne(1, 'c1');
      expect(result).toHaveProperty('reviewedCount', 1);
      expect(result).toHaveProperty('totalDue', 3);
      expect(result).toHaveProperty('cards');
    });

    it('throws NotFoundException when session not found', async () => {
      mockPrisma.studySession.findFirst.mockResolvedValue(null);
      await expect(service.findOne(1, 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitReview', () => {
    const sm2Result = {
      easeFactor: 2.6,
      interval: 1,
      repetitions: 1,
      dueDate: new Date(),
      isMastered: false,
    };

    it('submits a review and returns updated card state', async () => {
      mockPrisma.studySession.findFirst.mockResolvedValue({ id: 1, completedAt: null });
      mockPrisma.card.findUnique.mockResolvedValue({ id: 1, easeFactor: 2.5, interval: 1, repetitions: 0 });
      mockSm2.calculate.mockReturnValue(sm2Result);
      mockPrisma.$transaction.mockResolvedValue([]);
      const result = await service.submitReview(1, { cardId: 1, grade: GradeEnum.GOOD }, 'c1');
      expect(result).toHaveProperty('cardId', 1);
      expect(result).toHaveProperty('grade', 'GOOD');
      expect(result).toHaveProperty('isMastered', false);
    });

    it('throws NotFoundException when session not found', async () => {
      mockPrisma.studySession.findFirst.mockResolvedValue(null);
      await expect(service.submitReview(1, { cardId: 1, grade: GradeEnum.GOOD }, 'c1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when session already completed', async () => {
      mockPrisma.studySession.findFirst.mockResolvedValue({ id: 1, completedAt: new Date() });
      await expect(service.submitReview(1, { cardId: 1, grade: GradeEnum.GOOD }, 'c1')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when card not found', async () => {
      mockPrisma.studySession.findFirst.mockResolvedValue({ id: 1, completedAt: null });
      mockPrisma.card.findUnique.mockResolvedValue(null);
      await expect(service.submitReview(1, { cardId: 1, grade: GradeEnum.GOOD }, 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('completes session and returns accuracy summary', async () => {
      const reviews = [
        { grade: 'GOOD' },
        { grade: 'EASY' },
        { grade: 'HARD' },
        { grade: 'AGAIN' },
        { grade: 'GOOD' },
      ];
      mockPrisma.studySession.findFirst.mockResolvedValue({ id: 1, reviews });
      mockPrisma.studySession.update.mockResolvedValue({});
      const result = await service.complete(1, 'c1');
      expect(result.totalCards).toBe(5);
      expect(result.good).toBe(2);
      expect(result.easy).toBe(1);
      expect(result.hard).toBe(1);
      expect(result.again).toBe(1);
      expect(result.accuracyPercent).toBe(60);
    });

    it('returns 0 accuracy for empty session', async () => {
      mockPrisma.studySession.findFirst.mockResolvedValue({ id: 1, reviews: [] });
      mockPrisma.studySession.update.mockResolvedValue({});
      const result = await service.complete(1, 'c1');
      expect(result.accuracyPercent).toBe(0);
    });

    it('throws NotFoundException when session not found', async () => {
      mockPrisma.studySession.findFirst.mockResolvedValue(null);
      await expect(service.complete(1, 'c1')).rejects.toThrow(NotFoundException);
    });
  });
});
