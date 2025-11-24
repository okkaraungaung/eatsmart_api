// src/app/api/recipes/update/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { recipe_id, name, description, items } = body;

  if (!recipe_id)
    return NextResponse.json({ error: "recipe_id required" }, { status: 400 });

  try {
    await db.query(
      "UPDATE recipes SET name = ?, description = ? WHERE id = ?",
      [name, description, recipe_id]
    );

    // delete old ingredients
    await db.query("DELETE FROM recipe_items WHERE recipe_id = ?", [recipe_id]);

    // insert new ingredients
    for (const item of items) {
      await db.query(
        `INSERT INTO recipe_items (id, recipe_id, food_id, quantity)
         VALUES (UUID(), ?, ?, ?)`,
        [recipe_id, item.food_id, item.quantity]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
