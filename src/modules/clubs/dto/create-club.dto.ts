import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO: Request body for creating a club.
 */
export class CreateClubDto {
  // Club name shown publicly.
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  // Main club description.
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  // Category label (e.g., Sports, Coding).
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  category!: string;

  // Optional cover/profile image URL (legacy).
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  // Optional club avatar image URL.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  // Optional club banner image URL.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bannerUrl?: string;
}

