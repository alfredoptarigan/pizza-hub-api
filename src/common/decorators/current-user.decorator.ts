import { createParamDecorator, ExecutionContext } from "@nestjs/common";

type RequestUser = {
    sub: string;
    email: string;
    role: string;
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): RequestUser => {
        const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
        return request.user;
    },
);