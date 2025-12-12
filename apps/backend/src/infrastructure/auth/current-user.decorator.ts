import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
    id: number;
    email: string;
}

export const CurrentUser = createParamDecorator(
    (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext): CurrentUserPayload | number | string => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as CurrentUserPayload;

        if (data) {
            return user[data];
        }

        return user;
    },
);
