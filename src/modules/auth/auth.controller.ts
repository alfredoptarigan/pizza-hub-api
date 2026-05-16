import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
type CurrentUserPayload = {
    sub: string;
    email: string;
    role: string;
};
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('register')
    @ResponseMessage('Successfully registered user')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }
    @Post('login')
    @ResponseMessage('Successfully logged in user')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ResponseMessage('Successfully retrieved current user')
    me(@CurrentUser() user: CurrentUserPayload) {
        return this.authService.me(user);
    }
}
