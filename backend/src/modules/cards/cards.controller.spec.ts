import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

const mockCardsService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CardsController', () => {
  let controller: CardsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [{ provide: CardsService, useValue: mockCardsService }],
    }).compile();
    controller = module.get<CardsController>(CardsController);
  });

  it('findAll delegates to service', async () => {
    mockCardsService.findAll.mockResolvedValue([]);
    const result = await controller.findAll(1, 'c1');
    expect(mockCardsService.findAll).toHaveBeenCalledWith(1, 'c1');
    expect(result).toEqual([]);
  });

  it('create delegates to service', async () => {
    const card = { id: 1, front: 'Q', back: 'A' };
    mockCardsService.create.mockResolvedValue(card);
    const result = await controller.create(1, { front: 'Q', back: 'A' }, 'c1');
    expect(mockCardsService.create).toHaveBeenCalledWith(
      1,
      { front: 'Q', back: 'A' },
      'c1',
    );
    expect(result).toEqual(card);
  });

  it('update delegates to service', async () => {
    const card = { id: 1, front: 'Updated' };
    mockCardsService.update.mockResolvedValue(card);
    const result = await controller.update(1, { front: 'Updated' }, 'c1');
    expect(mockCardsService.update).toHaveBeenCalledWith(
      1,
      { front: 'Updated' },
      'c1',
    );
    expect(result).toEqual(card);
  });

  it('remove delegates to service', async () => {
    mockCardsService.remove.mockResolvedValue(undefined);
    const result = await controller.remove(1, 'c1');
    expect(mockCardsService.remove).toHaveBeenCalledWith(1, 'c1');
    expect(result).toBeUndefined();
  });
});
