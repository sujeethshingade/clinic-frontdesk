import { IsString, IsEnum, IsOptional, IsMongoId, IsDateString } from 'class-validator'

export class CreateAppointmentDto {
  @IsMongoId()
  patientId!: string

  @IsMongoId()
  doctorId!: string

  @IsDateString()
  date!: string

  @IsString()
  time!: string

  @IsString()
  @IsOptional()
  notes?: string
}

export class UpdateAppointmentDto {
  @IsDateString()
  @IsOptional()
  date?: string

  @IsString()
  @IsOptional()
  time?: string

  @IsEnum(['booked', 'completed', 'canceled'])
  @IsOptional()
  status?: 'booked' | 'completed' | 'canceled'

  @IsString()
  @IsOptional()
  notes?: string
}

export class RescheduleAppointmentDto {
  @IsDateString()
  date!: string

  @IsString()
  time!: string
}
