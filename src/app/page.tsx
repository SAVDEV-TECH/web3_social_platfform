import CreatePost from "@/components/CreatePost";
import Feed from "@/components/Feed";

export default function Home() {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-2xl space-y-6">
        {/* Create Post Section */}
        <section>
          <CreatePost />
        </section>

        {/* Global Feed Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-100">Global Feed</h2>
          </div>
          
          <Feed />
        </section>
      </div>
    </div>
  );
}
