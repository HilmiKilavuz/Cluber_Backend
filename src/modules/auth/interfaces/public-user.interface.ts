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

