import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'Verification code must be exactly 6 characters' })
  @IsNotEmpty()
  code!: string;
}
