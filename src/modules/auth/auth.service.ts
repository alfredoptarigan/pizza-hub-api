import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../users/user.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AuthPayload = {
    sub: string,
    email: string,
    role: UserRole;
}

type CurrentUserPayload = {
    sub: string;
    email: string;
    role: string;
};


type AuthResponse = {
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: UserRole;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }
}

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
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const existingUser = await this.userRepository.findByEmail(dto.email)

        if (existingUser) {
            throw new ConflictException('Email already exists')
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const user = await this.userRepository.create({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword
        })

        const accessToken = await this.generateAccessToken(user);
        return {
            accessToken,
            user: this.toSafeUser(user),
        };
    }

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const accessToken = await this.generateAccessToken(user);
        return {
            accessToken,
            user: this.toSafeUser(user),
        };
    }
    private async generateAccessToken(user: User): Promise<string> {
        const payload: AuthPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.signAsync(payload);
    }

    async me(currentUser: CurrentUserPayload): Promise<SafeUser> {
        const user = await this.userRepository.findById(currentUser.sub);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.toSafeUser(user);
    }

    private toSafeUser(user: User): AuthResponse['user'] {
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
