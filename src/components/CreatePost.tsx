"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ImagePlus, Send, Loader2 } from "lucide-react";

export default function CreatePost() {
  const { address, isConnected } = useAccount();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!content.trim() && !file) {
      setError("Post cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    let uploadedImageUrl = null;

    try {
      // 1. Upload Image to IPFS if exists
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Image upload failed");
        
        uploadedImageUrl = uploadData.pinataUrl;
      }

      // 2. Submit Post Data
      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          content,
          image_url: uploadedImageUrl,
        }),
      });

      const postData = await postRes.json();
      if (!postRes.ok) throw new Error(postData.error || "Post creation failed");

      // Success Reset
      setContent("");
      setFile(null);
      setPreviewUrl(null);
      // Optional: Trigger a refresh of the feed here
      alert("Post created successfully!");

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm text-center">
        <p className="text-gray-400">Connect your wallet to create a post.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-sm space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}
      
      <textarea
        className="w-full bg-gray-950 text-gray-100 border border-gray-800 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition"
        placeholder="What's happening in Web3?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
      />

      {previewUrl && (
        <div className="relative w-fit">
          <img src={previewUrl} alt="Preview" className="h-32 rounded-lg object-cover border border-gray-700" />
          <button 
            onClick={() => { setFile(null); setPreviewUrl(null); }}
            className="absolute -top-2 -right-2 bg-gray-800 text-gray-200 rounded-full p-1 hover:bg-red-500/20 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-gray-800">
        <label className="cursor-pointer text-gray-400 hover:text-blue-500 transition p-2 rounded-full hover:bg-blue-500/10">
          <ImagePlus size={20} />
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !file)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium transition"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          <span>Post</span>
        </button>
      </div>
    </div>
  );
}
