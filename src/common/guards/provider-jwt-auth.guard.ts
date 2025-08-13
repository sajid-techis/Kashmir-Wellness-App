import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ProviderJwtAuthGuard extends AuthGuard('provider-jwt') {}