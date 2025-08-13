import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { RegisterDto } from './register.dto';

export class ProviderRegisterDto extends RegisterDto {
  @IsString()
  @IsNotEmpty()
  providerName: string; // e.g., "Dr. John Doe", "City Labs", "General Hospital"

  @IsString()
  @IsNotEmpty()
  @IsIn(['Doctor', 'Lab', 'Hospital'], {
    message: 'providerType must be one of: Doctor, Lab, Hospital',
  })
  providerType: 'Doctor' | 'Lab' | 'Hospital';
}