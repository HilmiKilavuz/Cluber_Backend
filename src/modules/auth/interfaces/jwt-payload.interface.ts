/**
 * JWT payload shape stored inside access tokens.
 */
export interface JwtPayload {
  // Subject = authenticated user id.
  sub: string;

  // User email copied into token for quick access if needed.
  email: string;
}

