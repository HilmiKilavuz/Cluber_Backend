/**
 * Type declaration shim for `bcryptjs`.
 *
 * Why this file exists:
 * - Some environments may not expose complete typings automatically.
 * - This declaration gives strict TypeScript signatures for used methods.
 */
declare module 'bcryptjs' {
  // Hashes plain value (password) with given salt rounds.
  export function hash(value: string, saltOrRounds: string | number): Promise<string>;

  // Compares plain value with existing hash.
  export function compare(value: string, hashValue: string): Promise<boolean>;
}

