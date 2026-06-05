import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

const mockCategoriesService = {
  findAll: jest.fn(),
  findDecksInCategory: jest.fn(),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();
    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('findAll delegates to service', async () => {
    mockCategoriesService.findAll.mockResolvedValue([{ id: 1, name: 'A1' }]);
    const result = await controller.findAll();
    expect(mockCategoriesService.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('findDecks delegates to service', async () => {
    mockCategoriesService.findDecksInCategory.mockResolvedValue([]);
    const result = await controller.findDecks(1, 'c1');
    expect(mockCategoriesService.findDecksInCategory).toHaveBeenCalledWith(
      1,
      'c1',
    );
    expect(result).toEqual([]);
  });
});
