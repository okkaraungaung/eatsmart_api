// src/app/api/meal/by-date/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const user_id = searchParams.get("user_id");

  if (!date || !user_id)
    return NextResponse.json(
      { error: "Missing date or user_id" },
      { status: 400 }
    );

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT 
        f.name,
        mli.quantity AS grams,
        ROUND(f.calories * (mli.quantity / f.serving_size), 1) AS calories
      FROM meal_logs ml
      JOIN meal_log_items mli ON ml.id = mli.meal_log_id
      JOIN foods f ON mli.food_id = f.id
      WHERE ml.user_id = ?
        AND ml.date = ?
      ORDER BY ml.date DESC
      `,
      [user_id, date]
    );

    const totalCalories = rows.reduce(
      (sum, row) => sum + Number(row.calories ?? 0),
      0
    );

    return NextResponse.json({
      foods: rows,
      totalCalories,
    });
  } catch (err) {
    console.error("MEAL BY DATE ERROR:", err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
