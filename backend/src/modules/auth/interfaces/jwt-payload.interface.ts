export interface JwtPayload {
  sub: number; // user id
  login: string;
  roleId: number;
  roleName: string;
}
