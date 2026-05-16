const dateTimeSchema = {
  type: 'string',
  format: 'date-time',
  example: '2026-05-16T00:00:00.000Z',
};

const nullableStringSchema = (example: string | null) => ({
  type: 'string',
  nullable: true,
  example,
});

export const userSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'user-1',
    },
    name: {
      type: 'string',
      example: 'Alfredo',
    },
    email: {
      type: 'string',
      format: 'email',
      example: 'alfredo@example.com',
    },
    phone: nullableStringSchema('08123456789'),
    role: {
      type: 'string',
      enum: ['CUSTOMER', 'ADMIN', 'STAFF', 'SUPER_ADMIN'],
      example: 'CUSTOMER',
    },
    avatarUrl: nullableStringSchema(null),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  },
  required: [
    'id',
    'name',
    'email',
    'phone',
    'role',
    'avatarUrl',
    'createdAt',
    'updatedAt',
  ],
};

export const authDataSchema = {
  type: 'object',
  properties: {
    accessToken: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example',
    },
    user: userSchema,
  },
  required: ['accessToken', 'user'],
};

export const categorySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'category-1',
    },
    name: {
      type: 'string',
      example: 'Pizza',
    },
    slug: {
      type: 'string',
      example: 'pizza',
    },
    description: nullableStringSchema('Pizza menu'),
    imageUrl: nullableStringSchema('https://example.com/categories/pizza.jpg'),
    sortOrder: {
      type: 'integer',
      example: 1,
    },
    isActive: {
      type: 'boolean',
      example: true,
    },
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  },
  required: [
    'id',
    'name',
    'slug',
    'description',
    'imageUrl',
    'sortOrder',
    'isActive',
    'createdAt',
    'updatedAt',
  ],
};

const productImageSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'image-1',
    },
    productId: {
      type: 'string',
      example: 'product-1',
    },
    imageUrl: {
      type: 'string',
      example: 'https://example.com/products/super-supreme-pizza.jpg',
    },
    altText: nullableStringSchema('Super Supreme Pizza'),
    isPrimary: {
      type: 'boolean',
      example: true,
    },
    createdAt: dateTimeSchema,
  },
  required: [
    'id',
    'productId',
    'imageUrl',
    'altText',
    'isPrimary',
    'createdAt',
  ],
};

const productVariantSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'variant-1',
    },
    productId: {
      type: 'string',
      example: 'product-1',
    },
    name: {
      type: 'string',
      example: 'Large',
    },
    price: {
      type: 'integer',
      example: 120000,
    },
    discountPrice: {
      type: 'integer',
      nullable: true,
      example: 100000,
    },
    isActive: {
      type: 'boolean',
      example: true,
    },
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  },
  required: [
    'id',
    'productId',
    'name',
    'price',
    'discountPrice',
    'isActive',
    'createdAt',
    'updatedAt',
  ],
};

const productAddonSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'addon-1',
    },
    productId: {
      type: 'string',
      example: 'product-1',
    },
    name: {
      type: 'string',
      example: 'Extra Cheese',
    },
    price: {
      type: 'integer',
      example: 15000,
    },
    isActive: {
      type: 'boolean',
      example: true,
    },
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  },
  required: [
    'id',
    'productId',
    'name',
    'price',
    'isActive',
    'createdAt',
    'updatedAt',
  ],
};

export const productSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'product-1',
    },
    categoryId: {
      type: 'string',
      example: 'category-1',
    },
    name: {
      type: 'string',
      example: 'Super Supreme Pizza',
    },
    slug: {
      type: 'string',
      example: 'super-supreme-pizza',
    },
    description: nullableStringSchema('Loaded pizza with toppings'),
    basePrice: {
      type: 'integer',
      example: 120000,
    },
    discountPrice: {
      type: 'integer',
      nullable: true,
      example: 100000,
    },
    isActive: {
      type: 'boolean',
      example: true,
    },
    isFeatured: {
      type: 'boolean',
      example: true,
    },
    isRecommended: {
      type: 'boolean',
      example: true,
    },
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
    category: categorySchema,
    images: {
      type: 'array',
      items: productImageSchema,
    },
    variants: {
      type: 'array',
      items: productVariantSchema,
    },
    addons: {
      type: 'array',
      items: productAddonSchema,
    },
  },
  required: [
    'id',
    'categoryId',
    'name',
    'slug',
    'description',
    'basePrice',
    'discountPrice',
    'isActive',
    'isFeatured',
    'isRecommended',
    'createdAt',
    'updatedAt',
    'category',
    'images',
    'variants',
    'addons',
  ],
};
