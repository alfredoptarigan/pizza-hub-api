import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
type CurrentUserPayload = {
    sub: string;
    email: string;
    role: string;
};
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ResponseMessage('Successfully retrieved user profile')
    me(@CurrentUser() user: CurrentUserPayload) {
        return this.usersService.me(user);
    }
}
