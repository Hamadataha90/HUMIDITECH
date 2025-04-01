import { fetchProducts } from "../actions/productsActions";
import Loading from "../Loading";
import ProductCard from "../sharedcomponent/productCard";
import { Container, Row, Col } from "react-bootstrap";

export default async function ProductsPage() {
  let products = [];
  let error = null;

  try {
    products = await fetchProducts();
  } catch (err) {
    error = "Failed to load products. Please try again later.";
  }

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">All Products</h1>

      {!products.length && !error && <Loading message="Loading products..." />}

      {error && (
        <div className="text-center text-danger fw-bold">
          {error}
        </div>
      )}

      {!error && products.length > 0 && (
        <Row className="g-4">
          {products.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}

      {!error && !products.length && (
        <p className="text-center fw-bold">No products found.</p>
      )}
    </Container>
  );
}
