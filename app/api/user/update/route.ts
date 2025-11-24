// src/app/api/user/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    id,
    name,
    email,
    birthday,
    weight,
    height,
    gender,
    activity,
    daily_calorie_target,
  } = body;

  if (!id)
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  try {
    console.log("Updating user:", birthday);
    await db.query(
      `UPDATE users
       SET name = ?, email = ?, birthday = ?, weight = ?, height = ?, gender = ?, activity = ?, daily_calorie_target = ?
       WHERE id = ?`,
      [
        name,
        email,
        birthday,
        weight,
        height,
        gender,
        activity,
        daily_calorie_target,
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
