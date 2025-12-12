import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../application/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token manquant');
        }

        const payload = await this.authService.validateAccessToken(token);
        if (!payload) {
            throw new UnauthorizedException('Token invalide ou expiré');
        }

        // Attach user info to request
        (request as any).user = { id: payload.sub, email: payload.email };
        return true;
    }

    private extractTokenFromHeader(request: Request): string | null {
        const authHeader = request.headers.authorization;
        if (!authHeader) return null;

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : null;
    }
}
