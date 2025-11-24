// src/app/api/user/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, name, email, weight, height, daily_calorie_target, DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday, gender, activity FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    const user = rows[0];

    return NextResponse.json({ user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
