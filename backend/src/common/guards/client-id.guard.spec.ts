import { BadRequestException } from '@nestjs/common';
import { ClientIdGuard } from './client-id.guard';

function makeContext(clientId?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: clientId ? { 'x-client-id': clientId } : {},
      }),
    }),
  } as any;
}

describe('ClientIdGuard', () => {
  let guard: ClientIdGuard;

  beforeEach(() => {
    guard = new ClientIdGuard();
  });

  it('allows request with a valid UUID v4', () => {
    const ctx = makeContext('550e8400-e29b-41d4-a716-446655440000');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws BadRequestException when x-client-id header is missing', () => {
    const ctx = makeContext();
    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
  });

  it('throws BadRequestException for non-UUID value', () => {
    const ctx = makeContext('not-a-uuid');
    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
  });

  it('throws BadRequestException for UUID v1 (not v4)', () => {
    const ctx = makeContext('550e8400-e29b-11d4-a716-446655440000');
    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
  });
});
