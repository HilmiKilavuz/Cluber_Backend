import { IsArray, IsEmail, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

/**
 * DTO: Request body for user registration.
 *
 * DTO (Data Transfer Object) = API'ye gelen verinin tip + validasyon sözleşmesi.
 *
 * Password Policy (to prevent breaches):
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export class RegisterDto {
  // Must be a valid email format.
  @IsEmail()
  email!: string;

  // Strong password validation to prevent breaches.
  // 72 is a practical bcrypt boundary.
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/~`])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/~`]{8,72}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
  })
  password!: string;

  // Display name shown in UI.
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName!: string;

  // Optional short biography.
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;

  // Optional interest tags; every item must be string.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}

