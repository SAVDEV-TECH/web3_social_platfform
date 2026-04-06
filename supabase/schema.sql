-- SQL Script to set up the MVP Database for the Web3 Social Feed

-- Create Users Table
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Posts Table
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT, -- IPFS URL
  transaction_hash TEXT, -- Polygon transaction hash (Phase 4)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Likes Table
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- ensure a user can only like a post once
  UNIQUE (user_id, post_id)
);

-- Note: In a real Supabase setup, you would also enable RLS (Row Level Security) on these tables.
