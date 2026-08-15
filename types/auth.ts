export type UserRole = "CUSTOMER" | "ADMIN";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar: string | null;
};

export type JwtPayload = {
  userId: string;
  role: UserRole;
};
