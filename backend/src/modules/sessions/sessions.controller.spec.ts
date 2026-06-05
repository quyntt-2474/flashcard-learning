import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { GradeEnum } from './dto/submit-review.dto';

const mockSessionsService = {
  create: jest.fn(),
  findOne: jest.fn(),
  submitReview: jest.fn(),
  complete: jest.fn(),
};

describe('SessionsController', () => {
  let controller: SessionsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [{ provide: SessionsService, useValue: mockSessionsService }],
    }).compile();
    controller = module.get<SessionsController>(SessionsController);
  });

  it('create delegates to service', async () => {
    const session = { id: 1, dueCards: [] };
    mockSessionsService.create.mockResolvedValue(session);
    const result = await controller.create({ deckId: 1 }, 'c1');
    expect(mockSessionsService.create).toHaveBeenCalledWith({ deckId: 1 }, 'c1');
    expect(result).toEqual(session);
  });

  it('findOne delegates to service', async () => {
    const session = { id: 1, reviewedCount: 0 };
    mockSessionsService.findOne.mockResolvedValue(session);
    const result = await controller.findOne(1, 'c1');
    expect(mockSessionsService.findOne).toHaveBeenCalledWith(1, 'c1');
    expect(result).toEqual(session);
  });

  it('submitReview delegates to service', async () => {
    const review = { cardId: 1, grade: 'GOOD' };
    mockSessionsService.submitReview.mockResolvedValue(review);
    const dto = { cardId: 1, grade: GradeEnum.GOOD };
    const result = await controller.submitReview(1, dto, 'c1');
    expect(mockSessionsService.submitReview).toHaveBeenCalledWith(1, dto, 'c1');
    expect(result).toEqual(review);
  });

  it('complete delegates to service', async () => {
    const summary = { id: 1, accuracyPercent: 80 };
    mockSessionsService.complete.mockResolvedValue(summary);
    const result = await controller.complete(1, 'c1');
    expect(mockSessionsService.complete).toHaveBeenCalledWith(1, 'c1');
    expect(result).toEqual(summary);
  });
});
