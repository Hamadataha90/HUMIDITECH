"use client"; 

import { useState } from "react";
import { Container, Row, Col, Carousel, Spinner } from "react-bootstrap";
import ProductCard from "./productCard";

const Slider = ({ products, title = "", chunkSize = 3 }) => {
  const [loading, setLoading] = useState(false);

  if (!products || products.length === 0) {
    return <p className="text-center">No products available.</p>;
  }

  const productChunks = [];
  for (let i = 0; i < products.length; i += chunkSize) {
    productChunks.push(products.slice(i, i + chunkSize));
  }

  return (
    <div className="position-relative">
      <Container className="mt-2">
        <h2 className="text-center mb-4">{title}</h2>
        <Carousel interval={3000} pause="hover">
          {productChunks.map((chunk, index) => (
            <Carousel.Item key={index}>
              <Row className="justify-content-center g-4">
                {chunk.map((product) => (
                  <Col key={product.id} xs={12} sm={6} md={4}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
      {loading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0, 0, 0, 0.2)", zIndex: 10 }}
        >
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </div>
  );
};

export default Slider;