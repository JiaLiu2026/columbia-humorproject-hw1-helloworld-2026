import VoteFeed from "@/components/VoteFeed";

const demoCaptions = [
  {
    id: 1,
    caption_text: "When the deadline is tonight and your laptop updates now.",
    image_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    caption_text: "Me pretending this bug is a feature.",
    image_url: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function HomePage() {
  return (
    <main className="page">
      <h1 className="title">Humor Vote Lab</h1>
      <p className="subtitle">Upvote celebrates. Downvote drops.</p>
      <VoteFeed captions={demoCaptions} />
    </main>
  );
}

