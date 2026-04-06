import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";

    // If no real Supabase keys are provided, return mock data so the UI still functions
    if (supabaseUrl === "https://placeholder-url.supabase.co") {
      return NextResponse.json({
        posts: [
          {
            id: "mock-uuid-1",
            content: "Welcome to w3Feed! This is a mock post because no Supabase DB keys were detected in your .env.local file. Add your keys to see real Web3 data! 🚀",
            image_url: null,
            created_at: new Date().toISOString(),
            users: { username: "System", wallet_address: "0xMockData1234abcd" },
            likes: [],
          },
          {
            id: "mock-uuid-2",
            content: "Testing the IPFS Web3 Polygon architecture! 💎",
            image_url: null,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            users: { username: "Alice_Web3", wallet_address: "0x5678...abcd" },
            likes: [{ id: "temp", user_id: "random" }],
          }
        ]
      });
    }

    // Fetch posts ordered by newest, join with user, and get all likes
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        users ( username, wallet_address ),
        likes ( id, user_id )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Feed Error:", error);
      return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Feed Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
