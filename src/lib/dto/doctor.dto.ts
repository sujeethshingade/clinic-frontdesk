import { IsString, IsEnum, IsOptional, IsEmail, IsArray, ValidateNested, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

class AvailabilitySlotDto {
  @IsDateString()
  date!: string

  @IsArray()
  @IsString({ each: true })
  slots!: string[]
}

export class CreateDoctorDto {
  @IsString()
  name!: string

  @IsString()
  specialization!: string

  @IsEnum(['male', 'female', 'other'])
  gender!: 'male' | 'female' | 'other'

  @IsString()
  location!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  @IsOptional()
  availability?: AvailabilitySlotDto[]

  @IsString()
  @IsOptional()
  phone?: string

  @IsEmail()
  @IsOptional()
  email?: string
}

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  specialization?: string

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: 'male' | 'female' | 'other'

  @IsString()
  @IsOptional()
  location?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  @IsOptional()
  availability?: AvailabilitySlotDto[]

  @IsString()
  @IsOptional()
  phone?: string

  @IsEmail()
  @IsOptional()
  email?: string
}
