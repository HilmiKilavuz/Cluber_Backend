import { IsEnum, IsNotEmpty } from 'class-validator';

export enum RSVPStatus {
    GOING = 'GOING',
    INTERESTED = 'INTERESTED',
    NOT_GOING = 'NOT_GOING',
}

export class RsvpDto {
    @IsEnum(RSVPStatus)
    @IsNotEmpty()
    status!: RSVPStatus;
}
