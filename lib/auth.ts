import { cookies } from "next/headers";

import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import type { AuthUser, UserRole } from "@/types/auth";

export const AUTH_COOKIE_NAME = "phone_store_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export class AuthenticationError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AuthenticationError";
    this.status = status;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.users.findUnique({
    where: { id: BigInt(payload.userId) },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
    },
  });

  if (!user || user.status !== "ACTIVE") return null;

  return {
    id: user.id.toString(),
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role as UserRole,
    avatar: user.avatar,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError("Vui lòng đăng nhập để tiếp tục.");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new AuthenticationError(
      "Bạn không có quyền thực hiện thao tác này.",
      403,
    );
  }
  return user;
}
