export interface UserType {
  id: number;
  username: string;
  password?: string;
  realname?: string;
  email?: string;
  image?: string;
}

export interface SessionType {
  user: UserType;
  expires: string;
}

export interface TokenType {
  email?: string;
  picture?: string | null;
  sub: string;
  id: string;
  username: string;
  image?: string | null;
  realname?: string | null;
  iat: number;
  exp: number;
  jti: string;
}
