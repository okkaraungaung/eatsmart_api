import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const app_id = process.env.EDAMAM_APP_ID;
  const app_key = process.env.EDAMAM_APP_KEY;
  const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${app_id}&app_key=${app_key}&ingr=${encodeURIComponent(
    query
  )}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
