import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO for changing user password.
 * Enforces strong password policy to prevent breaches:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    currentPassword!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(72, { message: 'Password must be at most 72 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/~`])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/~`]{8,72}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
    })
    newPassword!: string;
}
