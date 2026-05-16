import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../../modules/auth/auth.module';
import { CategoriesModule } from '../../modules/categories/categories.module';
import { ProductsModule } from '../../modules/products/products.module';
import { UsersModule } from '../../modules/users/users.module';

export function setupApiDocs(app: INestApplication): void {
  const docsAuth = getDocsAuthCredentials();
  const config = new DocumentBuilder()
    .setTitle('PizzaHub API')
    .setDescription(
      'API documentation for auth, users, categories, and products',
    )
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('categories')
    .addTag('products')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [AuthModule, UsersModule, CategoriesModule, ProductsModule],
  });

  const httpAdapter = app.getHttpAdapter().getInstance();

  if (docsAuth) {
    httpAdapter.use('/openapi.json', createDocsAuthMiddleware(docsAuth));
    httpAdapter.use('/docs', createDocsAuthMiddleware(docsAuth));
  }

  httpAdapter.get('/openapi.json', (_request: Request, response: Response) => {
    response.json(document);
  });

  httpAdapter.use(
    '/docs',
    apiReference({
      url: '/openapi.json',
      theme: 'purple',
      pageTitle: 'PizzaHub API Reference',
    }),
  );
}

type DocsAuthCredentials = {
  username: string;
  password: string;
};

function getDocsAuthCredentials(): DocsAuthCredentials | null {
  const username = process.env.SCALAR_DOCS_USERNAME?.trim();
  const password = process.env.SCALAR_DOCS_PASSWORD?.trim();

  if (!username || !password) {
    return null;
  }

  return {
    username,
    password,
  };
}

function createDocsAuthMiddleware(credentials: DocsAuthCredentials) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      respondWithUnauthorized(response);
      return;
    }

    const [scheme, encodedCredentials] = authorizationHeader.split(' ');

    if (scheme !== 'Basic' || !encodedCredentials) {
      respondWithUnauthorized(response);
      return;
    }

    const decodedCredentials = Buffer.from(
      encodedCredentials,
      'base64',
    ).toString('utf-8');
    const separatorIndex = decodedCredentials.indexOf(':');

    if (separatorIndex < 0) {
      respondWithUnauthorized(response);
      return;
    }

    const username = decodedCredentials.slice(0, separatorIndex);
    const password = decodedCredentials.slice(separatorIndex + 1);

    if (
      username !== credentials.username ||
      password !== credentials.password
    ) {
      respondWithUnauthorized(response);
      return;
    }

    next();
  };
}

function respondWithUnauthorized(response: Response): void {
  response.setHeader('WWW-Authenticate', 'Basic realm="PizzaHub Docs"');
  response.status(401).send('Authentication required');
}
