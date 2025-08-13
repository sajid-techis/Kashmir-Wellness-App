import { PartialType } from '@nestjs/mapped-types';
import { IsString, MinLength, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Role } from '../../common/enums/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string; // If password is provided, it will be hashed before update

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role provided' })
  role?: Role;

  @IsOptional()
  @IsString()
  @MaxLength(13, { message: 'Phone number cannot exceed 13 characters' })
  phoneNumber?: string;
}