import { IsArray, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO: Request body for user registration.
 *
 * DTO (Data Transfer Object) = API'ye gelen verinin tip + validasyon sözleşmesi.
 */
export class RegisterDto {
  // Must be a valid email format.
  @IsEmail()
  email!: string;

  // Password must be between 8 and 72 chars.
  // 72 is a practical bcrypt boundary.
  @IsString()
  @MinLength(8)
  @MaxLength(72)
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

