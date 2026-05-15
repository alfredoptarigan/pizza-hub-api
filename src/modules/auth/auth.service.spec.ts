import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '.prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../users/user.repository';
import { AuthService } from './auth.service';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
type MockUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};
describe('AuthService', () => {
  let service: AuthService;
  const mockUserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };
  const mockJwtService = {
    signAsync: jest.fn(),
  };
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
  const baseUser: MockUser = {
    id: 'user-1',
    name: 'Alfredo',
    email: 'alfredo@example.com',
    phone: '08123456789',
    password: 'hashed-password',
    role: UserRole.CUSTOMER,
    avatarUrl: null,
    createdAt: new Date('2026-05-15T00:00:00.000Z'),
    updatedAt: new Date('2026-05-15T00:00:00.000Z'),
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });
  describe('register', () => {
    it('should register a new user and return access token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(baseUser);
      mockJwtService.signAsync.mockResolvedValue('access-token');
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
      const result = await service.register({
        name: 'Alfredo',
        email: 'alfredo@example.com',
        phone: '08123456789',
        password: 'password123',
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('alfredo@example.com');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'Alfredo',
        email: 'alfredo@example.com',
        phone: '08123456789',
        password: 'hashed-password',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: baseUser.id,
        email: baseUser.email,
        role: baseUser.role,
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        user: {
          id: baseUser.id,
          name: baseUser.name,
          email: baseUser.email,
          phone: baseUser.phone,
          role: baseUser.role,
          avatarUrl: baseUser.avatarUrl,
          createdAt: baseUser.createdAt,
          updatedAt: baseUser.updatedAt,
        },
      });
    });
    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(baseUser);
      await expect(
        service.register({
          name: 'Alfredo',
          email: 'alfredo@example.com',
          phone: '08123456789',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
  describe('login', () => {
    it('should login successfully and return access token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(baseUser);
      mockJwtService.signAsync.mockResolvedValue('access-token');
      mockedBcrypt.compare.mockResolvedValue(true as never);
      const result = await service.login({
        email: 'alfredo@example.com',
        password: 'password123',
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('alfredo@example.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', baseUser.password);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: baseUser.id,
        email: baseUser.email,
        role: baseUser.role,
      });
      expect(result.accessToken).toBe('access-token');
      expect(result.user.email).toBe(baseUser.email);
    });
    it('should throw UnauthorizedException when email is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(baseUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);
      await expect(
        service.login({
          email: 'alfredo@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrong-password', baseUser.password);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
  describe('me', () => {
    it('should return current user profile', async () => {
      mockUserRepository.findById.mockResolvedValue(baseUser);
      const result = await service.me({
        sub: baseUser.id,
        email: baseUser.email,
        role: baseUser.role,
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(baseUser.id);
      expect(result).toEqual({
        id: baseUser.id,
        name: baseUser.name,
        email: baseUser.email,
        phone: baseUser.phone,
        role: baseUser.role,
        avatarUrl: baseUser.avatarUrl,
        createdAt: baseUser.createdAt,
        updatedAt: baseUser.updatedAt,
      });
    });
    it('should throw NotFoundException when current user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(
        service.me({
          sub: 'missing-user',
          email: 'missing@example.com',
          role: UserRole.CUSTOMER,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});