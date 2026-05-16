type OpenApiSchema = Record<string, unknown>;

export function buildSuccessResponseSchema(
  dataSchema: OpenApiSchema,
  messageExample: string,
): OpenApiSchema {
  return {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        example: 'success',
      },
      message: {
        type: 'string',
        example: messageExample,
      },
      data: dataSchema,
    },
    required: ['status', 'message', 'data'],
  };
}
