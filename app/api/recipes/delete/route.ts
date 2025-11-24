// src/app/api/recipes/delete/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const recipe_id = searchParams.get("id");

  if (!recipe_id)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await db.query("DELETE FROM recipe_items WHERE recipe_id = ?", [recipe_id]);
    await db.query("DELETE FROM recipes WHERE id = ?", [recipe_id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
