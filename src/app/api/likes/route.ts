import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(request: Request) {
  try {
    const { post_id, wallet_address } = await request.json();

    if (!post_id || !wallet_address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Demo mode if Supabase isn't configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
    if (supabaseUrl === "https://placeholder-url.supabase.co") {
      return NextResponse.json({ success: true, liked: true });
    }

    // Get user id from wallet address
    let { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", wallet_address)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", post_id)
      .single();

    let result;

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);
      
      if (error) throw error;
      result = { liked: false };
    } else {
      // Like
      const { error } = await supabase
        .from("likes")
        .insert([{ user_id: user.id, post_id }]);

      if (error) throw error;
      result = { liked: true };
    }

    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    console.error("Like Action Error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
