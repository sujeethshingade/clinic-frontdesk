import { IsString, IsEnum, IsOptional, IsNumber, IsMongoId } from 'class-validator'

export class CreateQueueDto {
  @IsMongoId()
  patientId!: string

  @IsEnum(['normal', 'urgent'])
  @IsOptional()
  priority?: 'normal' | 'urgent'

  @IsNumber()
  @IsOptional()
  estimatedWait?: number

  @IsString()
  @IsOptional()
  notes?: string
}

export class UpdateQueueDto {
  @IsEnum(['waiting', 'with-doctor', 'completed'])
  @IsOptional()
  status?: 'waiting' | 'with-doctor' | 'completed'

  @IsEnum(['normal', 'urgent'])
  @IsOptional()
  priority?: 'normal' | 'urgent'

  @IsNumber()
  @IsOptional()
  estimatedWait?: number

  @IsString()
  @IsOptional()
  notes?: string
}
