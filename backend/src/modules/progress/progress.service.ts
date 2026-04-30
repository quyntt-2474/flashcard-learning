import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const CEFR_THRESHOLDS: Array<{ min: number; level: string }> = [
  { min: 85, level: 'C2' },
  { min: 75, level: 'C1' },
  { min: 65, level: 'B2' },
  { min: 55, level: 'B1' },
  { min: 40, level: 'A2' },
  { min: 0, level: 'A1' },
];

function mapCefr(accuracyPercent: number): string {
  for (const { min, level } of CEFR_THRESHOLDS) {
    if (accuracyPercent >= min) return level;
  }
  return 'A1';
}

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgress(clientId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all reviews for this client
    const reviews = await this.prisma.cardReview.findMany({
      where: {
        session: {
          clientId,
        },
      },
      select: {
        grade: true,
        reviewedAt: true,
        session: {
          select: {
            deck: {
              select: {
                categoryId: true,
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { reviewedAt: 'asc' },
    });

    const totalReviews = reviews.length;

    // Count mastered cards
    const masteredCards = await this.prisma.card.count({
      where: {
        clientId,
        isMastered: true,
      },
    });

    // Count due cards and find next due date
    const nextDueCard = await this.prisma.card.findFirst({
      where: {
        clientId,
        dueDate: { gt: now },
      },
      orderBy: { dueDate: 'asc' },
      select: { dueDate: true },
    });

    // Study streak calculation: consecutive days with at least one review session
    const sessionDays = await this.prisma.studySession.findMany({
      where: {
        clientId,
        completedAt: { not: null },
      },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });

    const streakDays = this.calcStreak(sessionDays.map((s) => s.completedAt!));

    if (totalReviews < 20) {
      return {
        cefrLevel: null,
        accuracyPercent: null,
        totalReviews,
        masteredCards,
        studyStreakDays: streakDays,
        nextDueDate: nextDueCard?.dueDate ?? null,
        byCategory: [],
        message:
          'Complete at least 20 card reviews to see your CEFR level estimate.',
      };
    }

    // Weighted accuracy: last 30 days = weight 2, older = weight 1
    let weightedCorrect = 0;
    let weightedTotal = 0;

    const byCategoryMap = new Map<
      number,
      { categoryName: string; correct: number; total: number }
    >();

    for (const review of reviews) {
      const isCorrect = review.grade === 'GOOD' || review.grade === 'EASY';
      const weight = review.reviewedAt >= thirtyDaysAgo ? 2 : 1;
      weightedCorrect += isCorrect ? weight : 0;
      weightedTotal += weight;

      const cat = review.session.deck.category;
      if (cat) {
        const existing = byCategoryMap.get(cat.id) ?? {
          categoryName: cat.name,
          correct: 0,
          total: 0,
        };
        existing.correct += isCorrect ? 1 : 0;
        existing.total += 1;
        byCategoryMap.set(cat.id, existing);
      }
    }

    const accuracyPercent =
      weightedTotal > 0
        ? Math.round((weightedCorrect / weightedTotal) * 100)
        : 0;

    const cefrLevel = mapCefr(accuracyPercent);

    const byCategory = Array.from(byCategoryMap.entries()).map(
      ([categoryId, data]) => ({
        categoryId,
        categoryName: data.categoryName,
        totalReviews: data.total,
        accuracyPercent:
          data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }),
    );

    return {
      cefrLevel,
      accuracyPercent,
      totalReviews,
      masteredCards,
      studyStreakDays: streakDays,
      nextDueDate: nextDueCard?.dueDate ?? null,
      byCategory,
    };
  }

  private calcStreak(completedDates: Date[]): number {
    if (completedDates.length === 0) return 0;

    // Get unique calendar days (UTC)
    const uniqueDays = new Set(
      completedDates.map((d) => d.toISOString().slice(0, 10)),
    );
    const sortedDays = Array.from(uniqueDays).sort().reverse();

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000)
      .toISOString()
      .slice(0, 10);

    // Streak must include today or yesterday to be active
    if (sortedDays[0] !== today && sortedDays[0] !== yesterday) return 0;

    let streak = 0;
    let current = sortedDays[0];

    for (const day of sortedDays) {
      if (day === current) {
        streak++;
        // Move expected date one day earlier
        const prev = new Date(current);
        prev.setUTCDate(prev.getUTCDate() - 1);
        current = prev.toISOString().slice(0, 10);
      } else {
        break;
      }
    }

    return streak;
  }
}
