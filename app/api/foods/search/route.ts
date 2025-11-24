import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface FoodRow extends RowDataPacket {
  id: string;
  name: string;
  brand: string | null;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  edamam_id: string | null;
}

interface EdamamFood {
  edamam_id: string;
  name: string;
  brand: string | null;
  nutrients: {
    ENERC_KCAL?: number;
    PROCNT?: number;
    FAT?: number;
    CHOCDF?: number;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";

  if (query.length < 2) {
    return NextResponse.json({ foods: [] });
  }

  try {
    // 1. Get foods from DB
    const [dbFoods] = await db.query<FoodRow[]>(
      "SELECT * FROM foods WHERE LOWER(name) LIKE LOWER(?) LIMIT 20",
      [`%${query.toLowerCase()}%`]
    );

    // 2. Edamam API call
    const app_id = process.env.EDAMAM_APP_ID;
    const app_key = process.env.EDAMAM_APP_KEY;

    const edamamUrl =
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${app_id}` +
      `&app_key=${app_key}&ingr=${encodeURIComponent(query)}`;

    const res = await fetch(edamamUrl);
    const data = await res.json();

    const edamamItems: EdamamFood[] = [
      ...(data.parsed || []),
      ...(data.hints || []),
    ]
      .filter((item: { food: FoodRow }) => item.food)
      .map((item: { food: FoodRow }) => ({
        edamam_id: item.food.foodId,
        name: item.food.label,
        brand: item.food.brand || null,
        nutrients: item.food.nutrients || {},
      }));

    const dbEdamamIds = new Set(dbFoods.map((f) => f.edamam_id));

    const filteredEdamam = edamamItems.filter(
      (f) => !dbEdamamIds.has(f.edamam_id)
    );

    return NextResponse.json({
      foods: [
        ...dbFoods.map((f) => ({ ...f, source: "db" })),
        ...filteredEdamam.map((f) => ({ ...f, source: "edamam" })),
      ],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
