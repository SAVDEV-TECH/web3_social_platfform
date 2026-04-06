"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWriteContract } from "wagmi";
import { Heart, MessageSquare, Anchor, Loader2 } from "lucide-react";
import { SOCIAL_FEED_ADDRESS, SOCIAL_FEED_ABI } from "@/utils/contract";

type Post = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  users: { wallet_address: string; username: string | null };
  likes: { id: string; user_id: string }[];
};

export default function Feed() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContract, isPending: isAnchoring } = useWriteContract();

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/feed");
      if (!res.ok) throw new Error("Failed to fetch feed");
      return res.json();
    },
    refetchInterval: 10000, // Poll every 10 seconds for real-time feel
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, wallet_address: address }),
      });
      if (!res.ok) throw new Error("Failed to like post");
      return res.json();
    },
    onMutate: async (postId) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousData = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          posts: old.posts.map((post: Post) => {
            if (post.id === postId) {
              const isLiked = post.likes.some(
                (like) => like.user_id === "optimistic-local-id"
              ); // In a perfect world we resolve the real user DB id but this logic bypasses temporarily.
              
              const newLikes = isLiked
                ? post.likes.filter((like) => like.user_id !== "optimistic-local-id")
                : [...post.likes, { id: "temp", user_id: "optimistic-local-id" }];
                
               return { ...post, likes: newLikes };
            }
            return post;
          }),
        };
      });

      return { previousData };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["posts"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin text-blue-500 rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center py-4">Error loading feed.</div>;
  
  const posts: Post[] = data?.posts || [];

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-900 border border-gray-800 rounded-xl">
        <p className="text-gray-400">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        // Just checking optimistic likes based on array length for UI demo purpose
        const likeCount = post.likes.length;
        const isHoverLike = "optimistic-local-id"; // We would map actual userId to check true ownership 
        
        return (
          <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm transition hover:border-gray-700">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-inner flex-shrink-0"></div>
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  {post.users?.username || `${post.users?.wallet_address?.slice(0, 6)}...${post.users?.wallet_address?.slice(-4)}`}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
              {post.content}
            </p>

            {/* Media */}
            {post.image_url && (
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-800 max-h-96 bg-gray-950 flex justify-center">
                <img 
                  src={post.image_url.startsWith('ipfs://') ? post.image_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : post.image_url} 
                  alt="Post attachment" 
                  className="object-contain max-h-96"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800/80">
              <div className="flex space-x-6">
                <button 
                  onClick={() => {
                    if (!address) alert("Connect wallet to like!");
                    else toggleLikeMutation.mutate(post.id);
                  }}
                  className="flex items-center space-x-1.5 text-gray-400 hover:text-red-500 transition group"
                >
                  <div className="p-1.5 rounded-full group-hover:bg-red-500/10">
                    <Heart size={18} className="transition-transform group-active:scale-90" />
                  </div>
                  <span className="text-sm font-medium">{likeCount}</span>
                </button>
                
                <button className="flex items-center space-x-1.5 text-gray-400 hover:text-blue-500 transition group">
                  <div className="p-1.5 rounded-full group-hover:bg-blue-500/10">
                    <MessageSquare size={18} />
                  </div>
                  <span className="text-sm font-medium">0</span>
                </button>
              </div>

              <div className="flex">
                <button
                  onClick={() => {
                    const postHash = post.image_url || post.content;
                    writeContract({
                      address: SOCIAL_FEED_ADDRESS as `0x${string}`,
                      abi: SOCIAL_FEED_ABI,
                      functionName: 'anchorPost',
                      args: [postHash],
                    });
                  }}
                  disabled={isAnchoring}
                  className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition"
                  title="Anchor permanently on Polygon"
                >
                  {isAnchoring ? <Loader2 size={14} className="animate-spin" /> : <Anchor size={14} />}
                  <span>{isAnchoring ? "Anchoring..." : "Anchor to Polygon"}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
