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
