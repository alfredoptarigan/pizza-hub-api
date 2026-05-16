import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

jest.mock('@scalar/nestjs-api-reference', () => ({
  apiReference:
    () => (_request: unknown, response: { send: (body: string) => void }) => {
      response.send(
        '<html><head><title>PizzaHub API Reference</title></head><body>scalar /openapi.json</body></html>',
      );
    },
}));

import { AppModule } from '../../src/app.module';
import { setupApiDocs } from '../../src/common/docs/swagger.config';
import { PrismaService } from '../../src/database/prisma.service';

describe('Docs E2E', () => {
  let app: INestApplication<App>;
  let originalDocsUsername: string | undefined;
  let originalDocsPassword: string | undefined;

  beforeAll(() => {
    originalDocsUsername = process.env.SCALAR_DOCS_USERNAME;
    originalDocsPassword = process.env.SCALAR_DOCS_PASSWORD;
  });

  beforeEach(async () => {
    delete process.env.SCALAR_DOCS_USERNAME;
    delete process.env.SCALAR_DOCS_PASSWORD;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
      }),
    );

    setupApiDocs(app);

    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  afterAll(() => {
    if (originalDocsUsername === undefined) {
      delete process.env.SCALAR_DOCS_USERNAME;
    } else {
      process.env.SCALAR_DOCS_USERNAME = originalDocsUsername;
    }

    if (originalDocsPassword === undefined) {
      delete process.env.SCALAR_DOCS_PASSWORD;
    } else {
      process.env.SCALAR_DOCS_PASSWORD = originalDocsPassword;
    }
  });

  it('GET /openapi.json should expose the generated OpenAPI document', async () => {
    const response = await request(app.getHttpServer()).get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBeDefined();
    expect(response.body.paths).toEqual(
      expect.objectContaining({
        '/auth/register': expect.any(Object),
        '/auth/login': expect.any(Object),
        '/auth/me': expect.any(Object),
        '/users/me': expect.any(Object),
        '/categories': expect.any(Object),
        '/categories/{slug}': expect.any(Object),
        '/products': expect.any(Object),
        '/products/{slug}': expect.any(Object),
      }),
    );
    expect(response.body.components.securitySchemes['access-token']).toEqual(
      expect.objectContaining({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }),
    );
  });

  it('GET /docs should serve the Scalar API reference UI', async () => {
    const response = await request(app.getHttpServer()).get('/docs');

    expect(response.status).toBe(200);
    expect(response.text).toContain('PizzaHub API Reference');
    expect(response.text).toContain('/openapi.json');
    expect(response.text.toLowerCase()).toContain('scalar');
  });

  it('GET /docs should require basic auth when docs credentials are configured', async () => {
    process.env.SCALAR_DOCS_USERNAME = 'docs-admin';
    process.env.SCALAR_DOCS_PASSWORD = 'secret123';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    const protectedApp = moduleFixture.createNestApplication();

    protectedApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
      }),
    );

    setupApiDocs(protectedApp);

    await protectedApp.init();

    const unauthorizedResponse = await request(
      protectedApp.getHttpServer(),
    ).get('/docs');

    expect(unauthorizedResponse.status).toBe(401);
    expect(unauthorizedResponse.headers['www-authenticate']).toContain('Basic');

    const authorizedResponse = await request(protectedApp.getHttpServer())
      .get('/docs')
      .auth('docs-admin', 'secret123');

    expect(authorizedResponse.status).toBe(200);
    expect(authorizedResponse.text).toContain('PizzaHub API Reference');

    const openApiUnauthorizedResponse = await request(
      protectedApp.getHttpServer(),
    ).get('/openapi.json');

    expect(openApiUnauthorizedResponse.status).toBe(401);

    const openApiAuthorizedResponse = await request(
      protectedApp.getHttpServer(),
    )
      .get('/openapi.json')
      .auth('docs-admin', 'secret123');

    expect(openApiAuthorizedResponse.status).toBe(200);
    expect(openApiAuthorizedResponse.body.openapi).toBeDefined();

    await protectedApp.close();
  });
});
