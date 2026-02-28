import { PublicUser } from './public-user.interface';

/**
 * Standard auth service response.
 *
 * - `accessToken`: signed JWT string.
 * - `user`: public-safe user data for UI.
 */
export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

