import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class EmergencyContactDto {
  @IsString()
  name!: string

  @IsString()
  phone!: string

  @IsString()
  relationship!: string
}

class ContactInfoDto {
  @IsString()
  phone!: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  address?: string

  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @IsOptional()
  emergencyContact?: EmergencyContactDto
}

export class CreatePatientDto {
  @IsString()
  fullName!: string

  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo!: ContactInfoDto

  @IsString()
  @IsOptional()
  medicalNotes?: string

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: 'male' | 'female' | 'other'
}

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  fullName?: string

  @ValidateNested()
  @Type(() => ContactInfoDto)
  @IsOptional()
  contactInfo?: ContactInfoDto

  @IsString()
  @IsOptional()
  medicalNotes?: string

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: 'male' | 'female' | 'other'
}
