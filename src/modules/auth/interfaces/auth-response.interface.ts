import { PublicUser } from './public-user.interface';

export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

