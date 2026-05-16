import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { buildSuccessResponseSchema } from '../../common/docs/api-response.schema';
import { userSchema } from '../../common/docs/openapi.schemas';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
type CurrentUserPayload = {
  sub: string;
  email: string;
  role: string;
};

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve the authenticated user profile' })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    schema: buildSuccessResponseSchema(
      userSchema,
      'Successfully retrieved user profile',
    ),
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ResponseMessage('Successfully retrieved user profile')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.me(user);
  }
}
