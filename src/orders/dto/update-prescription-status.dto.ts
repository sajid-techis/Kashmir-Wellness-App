import { IsEnum, IsNotEmpty } from 'class-validator';
import { PrescriptionStatus } from '../../schemas/order.schema';

export class UpdatePrescriptionStatusDto {
    @IsEnum(PrescriptionStatus)
    @IsNotEmpty()
    status: PrescriptionStatus;
}