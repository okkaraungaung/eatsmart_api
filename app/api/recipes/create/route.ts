// src/app/api/recipes/create/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const body = await req.json();

  const { user_id, name, description, items } = body;

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: "Items required" }, { status: 400 });
  }

  const recipeId = randomUUID();

  try {
    await db.query(
      "INSERT INTO recipes (id, user_id, name, description) VALUES (?, ?, ?, ?)",
      [recipeId, user_id, name, description]
    );

    for (const item of items) {
      await db.query(
        `INSERT INTO recipe_items (id, recipe_id, food_id, quantity)
         VALUES (?, ?, ?, ?)`,
        [randomUUID(), recipeId, item.food_id, item.quantity]
      );
    }

    return NextResponse.json({ success: true, recipe_id: recipeId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
