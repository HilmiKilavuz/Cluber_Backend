import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO: Request body for updating club fields.
 *
 * All fields are optional because PATCH supports partial updates.
 */
export class UpdateClubDto {
  // Optional new club name.
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name?: string;

  // Optional new description text.
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  // Optional new category.
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  category?: string;

  // Optional image URL update.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  // Optional active/passive state switch.
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

