import { IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../../schemas/appointment.schema';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}