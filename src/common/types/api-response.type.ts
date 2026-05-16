export type ApiSuccessResponse<T> = {
  status: 'success';
  message: string;
  data: T;
};
