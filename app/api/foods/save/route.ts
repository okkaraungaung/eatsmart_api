import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    name,
    brand = "",
    serving_size = 100,
    calories,
    protein,
    fat,
    carbs,
    edamam_id,
    created_by_user,
  } = body;

  try {
    // If this edamam_id already exists → return existing ID

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM foods WHERE edamam_id = ? LIMIT 1",
      [edamam_id]
    );

    if (rows.length > 0) {
      return NextResponse.json({ id: rows[0].id });
    }

    const id = randomUUID();

    await db.query(
      `INSERT INTO foods (
        id, name, brand, serving_size, calories, protein, fat, carbs, edamam_id, created_by_user
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
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

    return NextResponse.json({ id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
