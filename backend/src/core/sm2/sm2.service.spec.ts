import { Sm2Service, Sm2Input } from './sm2.service';

describe('Sm2Service', () => {
  let service: Sm2Service;

  beforeEach(() => {
    service = new Sm2Service();
  });

  const baseInput: Sm2Input = {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    grade: 'GOOD',
  };

  describe('grade AGAIN (SM-2 grade 0)', () => {
    it('resets repetitions to 0 and interval to 1', () => {
      const result = service.calculate({ ...baseInput, grade: 'AGAIN' });
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('does not change easeFactor on AGAIN', () => {
      const result = service.calculate({ ...baseInput, grade: 'AGAIN' });
      expect(result.easeFactor).toBeCloseTo(2.5);
    });

    it('marks isMastered false on AGAIN regardless of previous repetitions', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'AGAIN',
        repetitions: 5,
      });
      expect(result.isMastered).toBe(false);
    });
  });

  describe('grade HARD (SM-2 grade 3)', () => {
    it('keeps repetitions at 0 (below threshold), sets interval to 1', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'HARD',
        repetitions: 0,
      });
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('adjusts easeFactor downward for HARD', () => {
      const result = service.calculate({ ...baseInput, grade: 'HARD' });
      // EF = 2.5 + 0.1 - (5-3)*(0.08+(5-3)*0.02) = 2.5 + 0.1 - 2*0.12 = 2.5 - 0.14 = 2.36
      expect(result.easeFactor).toBeCloseTo(2.36, 2);
    });
  });

  describe('grade GOOD (SM-2 grade 4)', () => {
    it('first repetition sets interval to 1', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'GOOD',
        repetitions: 0,
      });
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('second repetition sets interval to 6', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'GOOD',
        repetitions: 1,
        interval: 1,
      });
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it('third repetition multiplies prev interval by EF', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'GOOD',
        repetitions: 2,
        interval: 6,
      });
      // new interval = round(6 * 2.5) = 15
      expect(result.interval).toBe(15);
      expect(result.repetitions).toBe(3);
    });

    it('does not drop easeFactor below 1.3 floor', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'AGAIN',
        easeFactor: 1.3,
      });
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('grade EASY (SM-2 grade 5)', () => {
    it('increases easeFactor for EASY', () => {
      const result = service.calculate({ ...baseInput, grade: 'EASY' });
      // EF = 2.5 + 0.1 - (5-5)*(0.08+(5-5)*0.02) = 2.5 + 0.1 = 2.6
      expect(result.easeFactor).toBeCloseTo(2.6, 2);
    });

    it('minimum interval for EASY on first repetition is 1', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'EASY',
        repetitions: 0,
      });
      expect(result.interval).toBeGreaterThanOrEqual(1);
    });
  });

  describe('isMastered threshold', () => {
    it('marks isMastered true when repetitions reach 4 and grade is GOOD', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'GOOD',
        repetitions: 3,
        interval: 10,
      });
      expect(result.isMastered).toBe(true);
    });

    it('marks isMastered true when repetitions reach 4 and grade is EASY', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'EASY',
        repetitions: 3,
        interval: 10,
      });
      expect(result.isMastered).toBe(true);
    });

    it('does not mark isMastered for repetitions < 4', () => {
      const result = service.calculate({
        ...baseInput,
        grade: 'GOOD',
        repetitions: 2,
        interval: 6,
      });
      expect(result.isMastered).toBe(false);
    });
  });

  describe('dueDate calculation', () => {
    it('returns a future dueDate offset by interval days', () => {
      const before = new Date();
      const result = service.calculate({
        ...baseInput,
        grade: 'GOOD',
        repetitions: 1,
        interval: 1,
      });
      const expectedMs = before.getTime() + 6 * 24 * 60 * 60 * 1000;
      expect(result.dueDate.getTime()).toBeGreaterThanOrEqual(
        expectedMs - 2000,
      );
    });
  });
});
