import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO: Request body for user login.
 */
export class LoginDto {
  // Login identifier must be valid email format.
  @IsEmail()
  email!: string;

  // Password must have minimum 8 characters.
  @IsString()
  @MinLength(8)
  password!: string;
}

