import { createFileRoute } from "@tanstack/react-router";
import { SholokHomepage } from "@/components/storefront/homepage";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Sholok — A little joy, every day | Bangladesh Online Shopping" },
    { name: "description", content: "Discover fashion, beauty, home essentials and more at Sholok. Shop 13 thoughtfully selected categories, daily deals and your next favourites in Bangladesh." },
    { property: "og:title", content: "Sholok — A little joy, every day" },
    { property: "og:description", content: "Fresh finds, everyday essentials and extraordinary prices. Discover a new way to shop Bangladesh with Sholok." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SholokHomepage,
});
