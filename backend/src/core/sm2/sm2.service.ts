import { Injectable } from '@nestjs/common';

export type Grade = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

const SM2_GRADE: Record<Grade, number> = {
  AGAIN: 0,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
};

export interface Sm2Input {
  easeFactor: number;
  interval: number;
  repetitions: number;
  grade: Grade;
}

export interface Sm2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: Date;
  isMastered: boolean;
}

@Injectable()
export class Sm2Service {
  calculate(input: Sm2Input): Sm2Result {
    const { grade } = input;
    const numericGrade = SM2_GRADE[grade];

    let { easeFactor, interval, repetitions } = input;

    if (numericGrade < 3) {
      // AGAIN — reset
      repetitions = 0;
      interval = 1;
    } else {
      // Adjust EF
      const newEF =
        easeFactor +
        0.1 -
        (5 - numericGrade) * (0.08 + (5 - numericGrade) * 0.02);
      easeFactor = Math.max(1.3, newEF);

      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      if (numericGrade >= 4) {
        repetitions += 1;
      }
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + interval);

    const isMastered =
      repetitions >= 4 && (grade === 'GOOD' || grade === 'EASY');

    return { easeFactor, interval, repetitions, dueDate, isMastered };
  }
}
