// src/app/api/meal/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ResultSetHeader } from "mysql2";

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // meal_log_item.id

  if (!id) {
    return NextResponse.json(
      { error: "Missing meal log item ID" },
      { status: 400 }
    );
  }

  try {
    // Delete a logged food record
    const [result] = await db.query<ResultSetHeader>(
      `DELETE FROM meal_log_items WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: id,
    });
  } catch (err) {
    console.error("DELETE MEAL ERROR:", err);
    return NextResponse.json(
      { error: "DB Error" },
      { status: 500 }
    );
  }
}
