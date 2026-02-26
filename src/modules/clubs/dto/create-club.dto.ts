import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClubDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  category!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}

