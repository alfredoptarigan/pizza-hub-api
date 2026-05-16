import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { buildSuccessResponseSchema } from '../../common/docs/api-response.schema';
import { authDataSchema, userSchema } from '../../common/docs/openapi.schemas';
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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: buildSuccessResponseSchema(
      authDataSchema,
      'Successfully registered user',
    ),
  })
  @ResponseMessage('Successfully registered user')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and issue a JWT token' })
  @ApiCreatedResponse({
    description: 'User logged in successfully',
    schema: buildSuccessResponseSchema(
      authDataSchema,
      'Successfully logged in user',
    ),
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ResponseMessage('Successfully logged in user')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve the currently authenticated user' })
  @ApiOkResponse({
    description: 'Current user retrieved successfully',
    schema: buildSuccessResponseSchema(
      userSchema,
      'Successfully retrieved current user',
    ),
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ResponseMessage('Successfully retrieved current user')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.me(user);
  }
}
