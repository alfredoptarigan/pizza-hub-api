import { DEFAULT_SUCCESS_MESSAGE } from '../constants/response.constants';
import { ApiSuccessResponse } from '../types/api-response.type';

export function buildSuccessResponse<T>(
  data: T,
  message = DEFAULT_SUCCESS_MESSAGE,
): ApiSuccessResponse<T> {
  return {
    status: 'success',
    message,
    data,
  };
}

export function isApiSuccessResponse(
  value: unknown,
): value is ApiSuccessResponse<unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'status' in value &&
    'message' in value &&
    'data' in value &&
    value.status === 'success'
  );
}
