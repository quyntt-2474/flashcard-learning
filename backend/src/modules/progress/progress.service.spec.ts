import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  cardReview: { findMany: jest.fn() },
  card: { count: jest.fn(), findFirst: jest.fn() },
  studySession: { findMany: jest.fn() },
};

function makeReviews(n: number, grade: string, daysAgo = 0) {
  const reviewedAt = new Date(Date.now() - daysAgo * 86_400_000);
  return Array.from({ length: n }, () => ({
    grade,
    reviewedAt,
    session: {
      deck: { categoryId: 1, category: { id: 1, name: 'Grammar' } },
    },
  }));
}

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ProgressService>(ProgressService);
  });

  describe('getProgress — fewer than 20 reviews', () => {
    it('returns null cefrLevel and a message', async () => {
      mockPrisma.cardReview.findMany.mockResolvedValue(makeReviews(5, 'GOOD'));
      mockPrisma.card.count.mockResolvedValue(0);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      const result = await service.getProgress('client-1');
      expect(result.cefrLevel).toBeNull();
      expect(result.accuracyPercent).toBeNull();
      expect(result).toHaveProperty('message');
    });

    it('includes masteredCards and totalReviews', async () => {
      mockPrisma.cardReview.findMany.mockResolvedValue([]);
      mockPrisma.card.count.mockResolvedValue(3);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      const result = await service.getProgress('client-1');
      expect(result.masteredCards).toBe(3);
      expect(result.totalReviews).toBe(0);
    });

    it('includes nextDueDate when a future card exists', async () => {
      const nextDue = new Date(Date.now() + 86400000);
      mockPrisma.cardReview.findMany.mockResolvedValue([]);
      mockPrisma.card.count.mockResolvedValue(0);
      mockPrisma.card.findFirst.mockResolvedValue({ dueDate: nextDue });
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      const result = await service.getProgress('client-1');
      expect(result.nextDueDate).toEqual(nextDue);
    });
  });

  describe('getProgress — 20+ reviews', () => {
    it('computes cefrLevel for 100% accuracy (C2)', async () => {
      mockPrisma.cardReview.findMany.mockResolvedValue(makeReviews(20, 'GOOD'));
      mockPrisma.card.count.mockResolvedValue(5);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      const result = await service.getProgress('client-1');
      expect(result.cefrLevel).toBe('C2');
      expect(result.accuracyPercent).toBe(100);
    });

    it('computes cefrLevel for 0% accuracy (A1)', async () => {
      mockPrisma.cardReview.findMany.mockResolvedValue(
        makeReviews(20, 'AGAIN'),
      );
      mockPrisma.card.count.mockResolvedValue(0);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      const result = await service.getProgress('client-1');
      expect(result.cefrLevel).toBe('A1');
      expect(result.accuracyPercent).toBe(0);
    });

    it('applies weight=2 for reviews in last 30 days', async () => {
      // 10 recent GOOD + 10 old AGAIN → weighted: 20 correct / 30 total ≈ 67% → B2
      const recentGood = makeReviews(10, 'GOOD', 0);
      const oldAgain = makeReviews(10, 'AGAIN', 40);
      mockPrisma.cardReview.findMany.mockResolvedValue([
        ...recentGood,
        ...oldAgain,
      ]);
      mockPrisma.card.count.mockResolvedValue(0);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      const result = await service.getProgress('client-1');
      // 10*2 correct / (10*2 + 10*1) total = 20/30 ≈ 67% → B2
      expect(result.accuracyPercent).toBe(67);
      expect(result.cefrLevel).toBe('B2');
    });

    it('populates byCategory correctly', async () => {
      mockPrisma.cardReview.findMany.mockResolvedValue(makeReviews(20, 'EASY'));
      mockPrisma.card.count.mockResolvedValue(0);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      const result = await service.getProgress('client-1');
      expect(result.byCategory).toHaveLength(1);
      expect(result.byCategory[0]).toHaveProperty('categoryName', 'Grammar');
      expect(result.byCategory[0].accuracyPercent).toBe(100);
    });

    it('skips reviews without category in byCategory', async () => {
      const reviews = Array.from({ length: 20 }, () => ({
        grade: 'GOOD',
        reviewedAt: new Date(),
        session: { deck: { categoryId: null, category: null } },
      }));
      mockPrisma.cardReview.findMany.mockResolvedValue(reviews);
      mockPrisma.card.count.mockResolvedValue(0);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      const result = await service.getProgress('client-1');
      expect(result.byCategory).toEqual([]);
    });
  });

  describe('streak calculation', () => {
    it('returns 0 when no completed sessions', async () => {
      mockPrisma.cardReview.findMany.mockResolvedValue([]);
      mockPrisma.card.count.mockResolvedValue(0);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      const result = await service.getProgress('client-1');
      expect(result.studyStreakDays).toBe(0);
    });

    it('returns streak of 2 for today and yesterday', async () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86_400_000);
      mockPrisma.cardReview.findMany.mockResolvedValue([]);
      mockPrisma.card.count.mockResolvedValue(0);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([
        { completedAt: today },
        { completedAt: yesterday },
      ]);
      const result = await service.getProgress('client-1');
      expect(result.studyStreakDays).toBe(2);
    });

    it('returns 0 when last session was 2 days ago', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000);
      mockPrisma.cardReview.findMany.mockResolvedValue([]);
      mockPrisma.card.count.mockResolvedValue(0);
      mockPrisma.card.findFirst.mockResolvedValue(null);
      mockPrisma.studySession.findMany.mockResolvedValue([
        { completedAt: twoDaysAgo },
      ]);
      const result = await service.getProgress('client-1');
      expect(result.studyStreakDays).toBe(0);
    });
  });
});
