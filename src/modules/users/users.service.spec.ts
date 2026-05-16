import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '.prisma/client';
import { UserRepository } from './user.repository';
import { UsersService } from './users.service';
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
describe('UsersService', () => {
  let service: UsersService;
  const mockUserRepository = {
    findById: jest.fn(),
  };
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
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });
  describe('me', () => {
    it('should return current user profile without password', async () => {
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
      expect(result).not.toHaveProperty('password');
    });
    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(
        service.me({
          sub: 'missing-user',
          email: 'missing@example.com',
          role: UserRole.CUSTOMER,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('missing-user');
    });
  });
});