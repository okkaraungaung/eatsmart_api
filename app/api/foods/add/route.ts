// src/app/api/foods/add/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const food = await req.json();

  const {
    name,
    brand,
    serving_size,
    calories,
    protein,
    fat,
    carbs,
    edamam_id,
    created_by_user = false,
  } = food;

  try {
    await db.query(
      `INSERT INTO foods 
        (id, name, brand, serving_size, calories, protein, fat, carbs, edamam_id, created_by_user)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        name,
        brand,
        serving_size,
        calories,
        protein,
        fat,
        carbs,
        edamam_id,
        created_by_user,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
