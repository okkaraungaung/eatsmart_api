import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { randomUUID } from "crypto";

interface BodyInput {
  user_id: string;
  food_id: string;
  grams: number;
  date: string; // YYYY-MM-DD
}

interface MealLogRow extends RowDataPacket {
  id: string;
}

export async function POST(req: NextRequest) {
  const body: BodyInput = await req.json();
  const { user_id, food_id, grams, date } = body;

  try {
    // 1. Check if meal_log exists
    const [existing] = await db.query<MealLogRow[]>(
      "SELECT id FROM meal_logs WHERE user_id = ? AND date = ? LIMIT 1",
      [user_id, date]
    );

    const mealLogId = existing.length ? existing[0].id : randomUUID();

    if (!existing.length) {
      await db.query(
        "INSERT INTO meal_logs (id, user_id, date) VALUES (?, ?, ?)",
        [mealLogId, user_id, date]
      );
    }

    // 2. Insert meal log item
    const itemId = randomUUID();

    await db.query(
      `INSERT INTO meal_log_items 
       (id, meal_log_id, type, food_id, quantity)
       VALUES (?, ?, 'food', ?, ?)`,
      [itemId, mealLogId, food_id, grams]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }
}
