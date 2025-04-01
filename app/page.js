import { fetchFeaturedProducts } from "@/app/actions/mainActions"; // استورد من ملف الـ API
import { Container } from "react-bootstrap";
import Slider from "./sharedcomponent/slider";

export default async function HomePage() {
  const products = await fetchFeaturedProducts(); // جلب المنتجات من Shopify

  return (
    <main className="container mt-5">
      <h1 className="text-center">
        Welcome to <span className="text-primary">Humidity-Zone</span> Store
      </h1>
      <Container className="mt-5">
        <Slider products={products} title="🌟 Featured Products" chunkSize={3} />
      </Container>
    </main>
  );
}

export const revalidate = 300; // ISR: تحديث كل 5 دقايق