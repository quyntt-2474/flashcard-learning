import { Test, TestingModule } from '@nestjs/testing';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';

const mockDecksService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('DecksController', () => {
  let controller: DecksController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecksController],
      providers: [{ provide: DecksService, useValue: mockDecksService }],
    }).compile();
    controller = module.get<DecksController>(DecksController);
  });

  it('findAll without categoryId delegates to service', async () => {
    mockDecksService.findAll.mockResolvedValue([]);
    const result = await controller.findAll('c1', undefined);
    expect(mockDecksService.findAll).toHaveBeenCalledWith('c1', undefined);
    expect(result).toEqual([]);
  });

  it('findAll with categoryId parses and passes it', async () => {
    mockDecksService.findAll.mockResolvedValue([]);
    await controller.findAll('c1', '3');
    expect(mockDecksService.findAll).toHaveBeenCalledWith('c1', 3);
  });

  it('findOne delegates to service', async () => {
    const deck = { id: 1, title: 'Test', cardCount: 0 };
    mockDecksService.findOne.mockResolvedValue(deck);
    const result = await controller.findOne(1, 'c1');
    expect(mockDecksService.findOne).toHaveBeenCalledWith(1, 'c1');
    expect(result).toEqual(deck);
  });

  it('create delegates to service', async () => {
    const deck = { id: 1, title: 'New', cardCount: 0 };
    mockDecksService.create.mockResolvedValue(deck);
    const result = await controller.create({ title: 'New' }, 'c1');
    expect(mockDecksService.create).toHaveBeenCalledWith({ title: 'New' }, 'c1');
    expect(result).toEqual(deck);
  });

  it('update delegates to service', async () => {
    const deck = { id: 1, title: 'Updated' };
    mockDecksService.update.mockResolvedValue(deck);
    const result = await controller.update(1, { title: 'Updated' }, 'c1');
    expect(mockDecksService.update).toHaveBeenCalledWith(1, { title: 'Updated' }, 'c1');
    expect(result).toEqual(deck);
  });

  it('remove delegates to service', async () => {
    mockDecksService.remove.mockResolvedValue(undefined);
    const result = await controller.remove(1, 'c1');
    expect(mockDecksService.remove).toHaveBeenCalledWith(1, 'c1');
    expect(result).toBeUndefined();
  });
});
