import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DEFAULT_SUCCESS_MESSAGE,
  RESPONSE_MESSAGE_METADATA_KEY,
} from '../constants/response.constants';
import {
  buildSuccessResponse,
  isApiSuccessResponse,
} from '../helpers/api-response.helper';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, unknown>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_METADATA_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT_SUCCESS_MESSAGE;

    return next.handle().pipe(
      map((data) => {
        if (isApiSuccessResponse(data)) {
          return data;
        }

        return buildSuccessResponse(data, message);
      }),
    );
  }
}
