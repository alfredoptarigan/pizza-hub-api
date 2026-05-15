import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/database/prisma.service';
import { AppModule } from '../../src/app.module';
describe('Auth E2E', () => {
  let app: INestApplication<App>;
  beforeEach(async () => {
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
    await app.init();
  });
  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
  it('POST /auth/register should return 400 when body is empty', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register').send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'name should not be empty',
        'name must be a string',
        'email should not be empty',
        'email must be an email',
        'password must be longer than or equal to 8 characters',
        'password must be a string',
      ]),
    );
    expect(response.body.error).toBe('Bad Request');
  });
  it('POST /auth/login should return 400 when body is empty', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'email should not be empty',
        'email must be an email',
        'password should not be empty',
        'password must be a string',
      ]),
    );
    expect(response.body.error).toBe('Bad Request');
  });
  it('GET /auth/me should return 401 without bearer token', async () => {
    const response = await request(app.getHttpServer()).get('/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });
});