/**
 * Public-safe user model returned to clients.
 *
 * Important: password hash is intentionally excluded.
 */
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

