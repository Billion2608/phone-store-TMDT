import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/types/auth";

type RegisterInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export class AuthServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AuthServiceError";
    this.status = status;
  }
}

function toAuthUser(user: {
  id: bigint;
  full_name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
  avatar: string | null;
}): AuthUser {
  return {
    id: user.id.toString(),
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
  };
}

const publicUserSelect = {
  id: true,
  full_name: true,
  email: true,
  phone: true,
  role: true,
  avatar: true,
} as const;

export async function registerUser(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const duplicate = await prisma.users.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { email: true, phone: true },
  });

  if (duplicate?.email === email) {
    throw new AuthServiceError("Email đã được sử dụng.", 409);
  }
  if (duplicate?.phone === phone) {
    throw new AuthServiceError("Số điện thoại đã được sử dụng.", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.users.create({
    data: {
      full_name: input.fullName.trim(),
      email,
      phone,
      password: passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    select: publicUserSelect,
  });

  return toAuthUser(user);
}

export async function authenticateUser(emailInput: string, password: string) {
  const user = await prisma.users.findUnique({
    where: { email: emailInput.trim().toLowerCase() },
    select: { ...publicUserSelect, password: true, status: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AuthServiceError("Email hoặc mật khẩu không chính xác.", 401);
  }
  if (user.status !== "ACTIVE") {
    throw new AuthServiceError(
      "Tài khoản hiện không được phép đăng nhập.",
      403,
    );
  }

  return toAuthUser(user);
}

function hashResetToken(token: string) {
  // Chỉ lưu mã băm để token gốc không bị lộ nếu database bị truy cập trái phép.
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordReset(emailInput: string) {
  const user = await prisma.users.findUnique({
    where: { email: emailInput.trim().toLowerCase() },
    select: { id: true, email: true, full_name: true },
  });
  if (!user) return null;
  const token = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.password_reset_tokens.deleteMany({ where: { user_id: user.id } }),
    prisma.password_reset_tokens.create({
      data: {
        user_id: user.id,
        token_hash: hashResetToken(token),
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
      },
    }),
  ]);
  return { token, email: user.email, name: user.full_name };
}

export async function resetPassword(token: string, password: string) {
  const tokenHash = hashResetToken(token);
  return prisma.$transaction(async (tx) => {
    const reset = await tx.password_reset_tokens.findUnique({
      where: { token_hash: tokenHash },
    });
    if (!reset || reset.used_at || reset.expires_at <= new Date())
      throw new AuthServiceError(
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
        422,
      );
    await tx.users.update({
      where: { id: reset.user_id },
      data: { password: await bcrypt.hash(password, 12) },
    });
    await tx.password_reset_tokens.update({
      where: { id: reset.id },
      data: { used_at: new Date() },
    });
    await tx.password_reset_tokens.deleteMany({
      where: { user_id: reset.user_id, id: { not: reset.id } },
    });
    return { reset: true };
  });
}

export async function updateProfile(
  userId: string,
  input: {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    address: string;
  },
) {
  const phone = input.phone.trim();
  const duplicate = await prisma.users.findFirst({
    where: { phone, id: { not: BigInt(userId) } },
    select: { id: true },
  });
  if (duplicate)
    throw new AuthServiceError("Số điện thoại đã được sử dụng.", 409);
  return prisma.$transaction(async (tx) => {
    const user = await tx.users.update({
      where: { id: BigInt(userId) },
      data: { full_name: input.fullName.trim(), phone },
      select: publicUserSelect,
    });
    await tx.addresses.updateMany({
      where: { user_id: BigInt(userId) },
      data: { is_default: false },
    });
    const currentAddress = await tx.addresses.findFirst({
      where: { user_id: BigInt(userId) },
      orderBy: { updated_at: "desc" },
    });
    const addressData = {
      receiver_name: input.fullName.trim(),
      receiver_phone: phone,
      province: input.province,
      district: input.district,
      ward: input.ward,
      address_line: input.address,
      is_default: true,
    };
    if (currentAddress)
      await tx.addresses.update({
        where: { id: currentAddress.id },
        data: addressData,
      });
    else
      await tx.addresses.create({
        data: { user_id: BigInt(userId), ...addressData },
      });
    return toAuthUser(user);
  });
}
