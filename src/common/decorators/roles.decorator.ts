import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum'; // Adjust path if your enum is elsewhere

export const ROLES_KEY = 'roles'; // A unique key to store metadata
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);