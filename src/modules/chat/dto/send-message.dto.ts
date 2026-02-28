import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO: Request body for sending a chat message.
 */
export class SendMessageDto {
  // Message content must be non-empty and reasonably bounded.
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}

