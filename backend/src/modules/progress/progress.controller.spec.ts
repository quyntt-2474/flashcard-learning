import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

const mockProgressService = { getProgress: jest.fn() };

describe('ProgressController', () => {
  let controller: ProgressController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [{ provide: ProgressService, useValue: mockProgressService }],
    }).compile();
    controller = module.get<ProgressController>(ProgressController);
  });

  it('getProgress delegates to service', async () => {
    const progress = { cefrLevel: 'B2', accuracyPercent: 70 };
    mockProgressService.getProgress.mockResolvedValue(progress);
    const result = await controller.getProgress('c1');
    expect(mockProgressService.getProgress).toHaveBeenCalledWith('c1');
    expect(result).toEqual(progress);
  });
});
