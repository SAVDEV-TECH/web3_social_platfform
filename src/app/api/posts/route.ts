import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet_address, content, image_url } = body;

    if (!wallet_address || (!content && !image_url)) {
      return NextResponse.json(
        { error: "Invalid payload. Needs wallet address and content/image." },
        { status: 400 }
      );
    }

    // Demo mode: Return successful response if supabase hasn't been configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
    if (supabaseUrl === "https://placeholder-url.supabase.co") {
      return NextResponse.json({ 
        success: true, 
        post: {
          id: "mock-post-" + Date.now(),
          user_id: "mock-user-uuid",
          content,
          image_url,
          created_at: new Date().toISOString()
        }
      });
    }

    // IMPORTANT: Since we have a 'Users' table and a 'Posts' table, we need to ensure the user exists first.
    // If user doesn't exist, create them implicitly (Auto-signup for Web3).
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", wallet_address)
      .single();

    if (!user) {
      // Create user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{ wallet_address }])
        .select("id")
        .single();
        
      if (createError) {
        console.error("Error creating user:", createError);
        return NextResponse.json({ error: "Failed to verify user profile" }, { status: 500 });
      }
      user = newUser;
    }

    // Insert the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert([
        {
          user_id: user?.id,
          content: content || "",
          image_url: image_url || null,
        },
      ])
      .select("*")
      .single();

    if (postError) {
      console.error("Supabase Post Error:", postError);
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }

    return NextResponse.json({ success: true, post });

  } catch (error) {
    console.error("Post Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
