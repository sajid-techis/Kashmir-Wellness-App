import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum'; // Adjust path
import { ROLES_KEY } from '../decorators/roles.decorator'; // Adjust path

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      return false; // User not authenticated or has no role, deny access
    }

    // Normalize the user's role(s) into an array for a consistent check
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    // Check if any of the user's roles match the required roles
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}