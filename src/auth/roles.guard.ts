import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from './roles.decorator'; // Import the key

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // If no roles are specified, allow access
    }

    const { user } = context.switchToHttp().getRequest();

    // Check if the user exists and has at least one of the required roles
    // user.role should be a string (e.g., 'admin', 'user')
    // requiredRoles is an array of strings (e.g., ['admin', 'user'])
    return requiredRoles.some((role) => user.role === role);
  }
}