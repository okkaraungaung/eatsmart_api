// src/app/api/meal/today/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const user_id = searchParams.get("user_id");
  const date = searchParams.get("date");

  if (!user_id || !date) {
    return NextResponse.json(
      { error: "Missing user_id or date" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT 
        SUM(
          CASE 
            WHEN mli.type = 'food' 
              THEN f.calories * (mli.quantity / f.serving_size)
            WHEN mli.type = 'recipe'
              THEN (
                SELECT SUM(
                  fi.calories * (ri.quantity / fi.serving_size)
                )
                FROM recipe_items ri
                JOIN foods fi ON ri.food_id = fi.id
                WHERE ri.recipe_id = mli.recipe_id
              ) * mli.quantity
          END
        ) AS total_calories,

        SUM(
          CASE 
            WHEN mli.type = 'food' 
              THEN f.protein * (mli.quantity / f.serving_size)
            WHEN mli.type = 'recipe'
              THEN (
                SELECT SUM(
                  fi.protein * (ri.quantity / fi.serving_size)
                )
                FROM recipe_items ri
                JOIN foods fi ON ri.food_id = fi.id
                WHERE ri.recipe_id = mli.recipe_id
              ) * mli.quantity
          END
        ) AS total_protein,

        SUM(
          CASE 
            WHEN mli.type = 'food' 
              THEN f.fat * (mli.quantity / f.serving_size)
            WHEN mli.type = 'recipe'
              THEN (
                SELECT SUM(
                  fi.fat * (ri.quantity / fi.serving_size)
                )
                FROM recipe_items ri
                JOIN foods fi ON ri.food_id = fi.id
                WHERE ri.recipe_id = mli.recipe_id
              ) * mli.quantity
          END
        ) AS total_fat,

        SUM(
          CASE 
            WHEN mli.type = 'food' 
              THEN f.carbs * (mli.quantity / f.serving_size)
            WHEN mli.type = 'recipe'
              THEN (
                SELECT SUM(
                  fi.carbs * (ri.quantity / fi.serving_size)
                )
                FROM recipe_items ri
                JOIN foods fi ON ri.food_id = fi.id
                WHERE ri.recipe_id = mli.recipe_id
              ) * mli.quantity
          END
        ) AS total_carbs

      FROM meal_log_items mli
      JOIN meal_logs ml ON ml.id = mli.meal_log_id
      LEFT JOIN foods f ON mli.food_id = f.id
      WHERE ml.user_id = ? AND ml.date = ?
      `,
      [user_id, date]
    );

    return NextResponse.json({
      calories: rows[0]?.total_calories || 0,
      protein: rows[0]?.total_protein || 0,
      fat: rows[0]?.total_fat || 0,
      carbs: rows[0]?.total_carbs || 0,
    });
  } catch (err) {
    console.error("TODAY API ERROR:", err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
