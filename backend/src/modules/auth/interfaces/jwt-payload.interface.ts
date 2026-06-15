export interface JwtPayload {
  sub: number; // user id
  login: string;
  roleId: number;
  roleName: string;
  tv?: number; // refresh-token version (refresh tokens only)
}
