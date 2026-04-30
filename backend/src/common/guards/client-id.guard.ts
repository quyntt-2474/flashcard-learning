import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ClientIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string> }>();
    const clientId = request.headers['x-client-id'];

    if (!clientId || !UUID_V4_REGEX.test(clientId)) {
      throw new BadRequestException(
        'X-Client-ID header is required and must be a valid UUID v4',
      );
    }
    return true;
  }
}
