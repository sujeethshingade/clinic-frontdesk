import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  username!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsEnum(['staff', 'admin'])
  @IsOptional()
  role?: 'staff' | 'admin'
}

export class LoginUserDto {
  @IsString()
  username!: string

  @IsString()
  password!: string
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsEnum(['staff', 'admin'])
  @IsOptional()
  role?: 'staff' | 'admin'
}
