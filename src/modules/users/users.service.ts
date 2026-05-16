import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '.prisma/client';
import { UserRepository } from './user.repository';
type CurrentUserPayload = {
    sub: string;
    email: string;
    role: string;
};
type SafeUser = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
};
@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) { }
    async me(currentUser: CurrentUserPayload): Promise<SafeUser> {
        const user = await this.userRepository.findById(currentUser.sub);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.toSafeUser(user);
    }
    private toSafeUser(user: User): SafeUser {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}