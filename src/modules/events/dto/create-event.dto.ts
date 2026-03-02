import { IsString, IsNotEmpty, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @IsString()
    @IsNotEmpty()
    location!: string;

    @IsUUID()
    @IsNotEmpty()
    clubId!: string;
}
