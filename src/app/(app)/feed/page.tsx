import { Suspense } from "react";
import { CourtFeed } from "@/features/courts/CourtFeed";

export default function FeedPage() {
  return (
    <Suspense>
      <CourtFeed />
    </Suspense>
  );
}
