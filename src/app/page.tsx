import { ComingSoonPage } from "@/components/coming-soon/ComingSoonPage";
import { HomePageClient } from "@/components/home/HomePageClient";
import { HomeLocalSeo } from "@/components/home/HomeLocalSeo";
import { isComingSoonEnabled } from "@/lib/coming-soon";

export default function Home() {
  if (isComingSoonEnabled()) {
    return <ComingSoonPage />;
  }
  return (
    <>
      <HomePageClient />
      <HomeLocalSeo />
    </>
  );
}
