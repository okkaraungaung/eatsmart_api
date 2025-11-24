// src/app/api/recipes/detail/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "Missing recipe id" }, { status: 400 });

  try {
    const [[recipe]] = await db.query<RowDataPacket[]>(
      "SELECT * FROM recipes WHERE id = ? LIMIT 1",
      [id]
    );

    if (!recipe)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [items] = await db.query(
      `SELECT 
         ri.id AS item_id,
         ri.quantity AS grams,
         f.id AS food_id,
         f.name AS label,
         f.calories,
         f.protein,
         f.fat,
         f.carbs
       FROM recipe_items ri
       JOIN foods f ON f.id = ri.food_id
       WHERE ri.recipe_id = ?`,
      [id]
    );

    return NextResponse.json({
      recipe,
      items,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
