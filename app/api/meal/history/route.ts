import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface HistoryRow extends RowDataPacket {
  date: string;
  calories: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    const [rows] = await db.query<HistoryRow[]>(
      `
      SELECT 
        ml.date,
        SUM(
          CASE 
            WHEN mli.type = 'food' 
              THEN f.calories * (mli.quantity / f.serving_size)
            ELSE 0
          END
        ) AS calories
      FROM meal_logs ml
      LEFT JOIN meal_log_items mli ON ml.id = mli.meal_log_id
      LEFT JOIN foods f ON mli.food_id = f.id
      WHERE ml.user_id = ?
      GROUP BY ml.date
      ORDER BY ml.date DESC
      LIMIT 7
      `,
      [user_id]
    );

    return NextResponse.json({ history: rows });
  } catch (err) {
    console.error("History API Error:", err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
