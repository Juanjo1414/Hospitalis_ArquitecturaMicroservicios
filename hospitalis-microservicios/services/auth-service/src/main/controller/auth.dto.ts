import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  specialty?: string;
}

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;

  @IsString()
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}
