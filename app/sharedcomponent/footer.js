"use client";
import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-light text-dark py-4 mt-5 shadow-sm">
      <Container>
        <Row className="text-center text-md-start">
          {/* About Section */}
          <Col md={4} className="mb-3">
            <h5 className="fw-bold">Summer Style</h5>
            <p>Discover the latest trends in fashion and style. High-quality products at great prices!</p>
          </Col>

          {/* Quick Links */}
          <Col md={4} className="mb-3">
            <h5 className="fw-bold">Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link href="/" passHref legacyBehavior>
                  <a className="text-dark text-decoration-none">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/products" passHref legacyBehavior>
                  <a className="text-dark text-decoration-none">Products</a>
                </Link>
              </li>
              <li>
                <Link href="/offers" passHref legacyBehavior>
                  <a className="text-dark text-decoration-none">Offers</a>
                </Link>
              </li>
              <li>
                <Link href="/contact" passHref legacyBehavior>
                  <a className="text-dark text-decoration-none">Contact Us</a>
                </Link>
              </li>
            </ul>
          </Col>

          {/* Contact Section */}
          <Col md={4} className="mb-3">
            <h5 className="fw-bold">Contact</h5>
            <p>Email: support@Summerstyle.com</p>
            <p>Phone: +1 234 567 890</p>
            <p>Address: 123 Fashion St, New York, USA</p>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="text-center mt-3">
          <Col>
            <p className="mb-0">&copy; {new Date().getFullYear()} Summer Style. All Rights Reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
