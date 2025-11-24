import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const [rows] = await db.query<UserRow[]>(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  const user = rows[0];

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 400 }
    );
  }

  // Compare hashed password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}
