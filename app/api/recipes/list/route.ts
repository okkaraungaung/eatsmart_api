// src/app/api/recipes/list/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    // 1. Fetch recipes
    const [recipes] = await db.query(
      "SELECT id, name, description FROM recipes WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    // 2. For each recipe, fetch its items + JOIN foods
    const fullRecipes = [];

    for (const r of recipes as RowDataPacket[]) {
      const [items] = await db.query(
        `
        SELECT 
          ri.id,
          ri.food_id,
          ri.quantity,
          f.name AS food_name,
          f.brand,
          f.calories,
          f.protein,
          f.fat,
          f.carbs,
          f.serving_size
        FROM recipe_items ri
        JOIN foods f ON ri.food_id = f.id
        WHERE ri.recipe_id = ?
        `,
        [r.id]
      );

      fullRecipes.push({
        ...r,
        ingredients: items,
      });
    }

    return NextResponse.json({ recipes: fullRecipes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
