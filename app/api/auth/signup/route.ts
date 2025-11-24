import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // check if email exists
  const [exists] = await db.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (Array.isArray(exists) && exists.length > 0) {
    return NextResponse.json({ error: "Email already used" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const id = randomUUID();

  await db.query(
    "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    [id, name, email, hash]
  );

  return NextResponse.json({ success: true, user_id: id });
}
