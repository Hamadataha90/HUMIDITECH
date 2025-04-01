import { fetchProductById } from "../../actions/productsActions";
import ProductDetails from "./ProductDetails";
import { Suspense } from "react";
import { Spinner } from "react-bootstrap";

export default async function ProductPage({ params }) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "50vh" }}
        >
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      }
    >
      <ProductContent id={id} />
    </Suspense>
  );
}

async function ProductContent({ id }) {
  const product = await fetchProductById(id);

  if (!product) {
    return <div>Product not found!</div>;
  }

  return <ProductDetails product={product} />;
}