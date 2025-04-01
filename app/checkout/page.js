"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { createPaypalPayment } from "../actions/paypal";

const isValidCSSColor = (color) => {
  const s = new Option().style;
  s.color = color;
  return s.color !== "";
};

const normalizeColor = (color) => {
  const colorMap = { kaki: "khaki", grey: "gray" };
  return colorMap[color.toLowerCase()] || color.toLowerCase();
};

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const paypalRendered = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    console.log("Stored Cart from localStorage:", storedCart);
    if (storedCart.length > 0) {
      const formattedCart = storedCart.map((item) => ({
        ...item,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity, 10) || 1,
        color: normalizeColor(item.color || "unknown"),
      })).filter((item) => item.price > 0);
      console.log("Formatted Cart:", formattedCart);
      setCartItems(formattedCart);
      if (formattedCart.length === 0) {
        setMessage({ type: "warning", text: "No valid items in cart! Redirecting to products..." });
        setTimeout(() => router.push("/products"), 2000);
      }
    } else {
      setMessage({ type: "warning", text: "Your cart is empty! Redirecting to products..." });
      setTimeout(() => router.push("/products"), 2000);
    }
  }, [router]);

  useEffect(() => {
    if (paypalLoaded || document.getElementById("paypal-sdk")) return;

    console.log("PayPal Client ID:", process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID); // للتحقق

    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
      setMessage({ type: "danger", text: "PayPal Client ID is missing. Please check your environment variables." });
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}¤cy=USD`;
    script.async = true;
    script.onload = () => {
      console.log("PayPal SDK Loaded Successfully");
      setPaypalLoaded(true);
    };
    script.onerror = (error) => {
      console.error("PayPal SDK Load Error:", error);
      setMessage({ type: "danger", text: "Failed to load PayPal SDK. Check your network or Client ID." });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [paypalLoaded]);

  useEffect(() => {
    if (paypalLoaded && cartItems.length > 0 && !paypalRendered.current) {
      renderPaypalButtons();
      paypalRendered.current = true;
    }
  }, [paypalLoaded, cartItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const totalPrice = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  const renderPaypalButtons = () => {
    if (!window.paypal || !document.getElementById("paypal-button-container")) return;

    setLoading(true);
    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: totalPrice,
                currency_code: "USD",
              },
            }],
            intent: "CAPTURE",
          });
        },
        onApprove: async (data, actions) => {
          setLoading(true);
          try {
            const order = await actions.order.capture();
            const orderId = order.id;
            console.log("Captured Order:", order);

            // نستدعي الـ server action لو محتاج تأكيد (اختياري)
            await createPaypalPayment(totalPrice);

            setMessage({
              type: "success",
              text: `Payment completed! Order ID: ${orderId}. Redirecting...`,
            });
            localStorage.removeItem("cart");
            setTimeout(() => router.push("/order-confirmation"), 2000);
          } catch (error) {
            setMessage({ type: "danger", text: "Payment capture failed. Please try again." });
            console.error("Capture Error:", error);
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          setMessage({ type: "danger", text: "Payment failed. Please try again." });
          console.error("PayPal Error:", err);
          setLoading(false);
        },
        onCancel: () => {
          setMessage({ type: "info", text: "Payment cancelled." });
          setLoading(false);
        },
      })
      .render("#paypal-button-container")
      .then(() => setLoading(false));
  };

  const handleOrderConfirmation = () => {
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.city) {
      setMessage({ type: "warning", text: "Please fill in all required shipping fields." });
      return;
    }
    if (parseFloat(totalPrice) <= 0) {
      setMessage({ type: "warning", text: "Cannot confirm order: Total amount must be greater than $0.00." });
      return;
    }
    setLoading(true);
    const orderDetails = { cartItems, shippingInfo, totalPrice, orderDate: new Date().toISOString() };
    localStorage.setItem("lastOrder", JSON.stringify(orderDetails));
    localStorage.removeItem("cart");
    setMessage({ type: "success", text: "Order confirmed! Redirecting..." });
    setTimeout(() => router.push("/order-confirmation"), 2000);
  };

  if (!cartItems.length && !message) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 mb-5" style={{ maxWidth: "900px" }}>
      <h1 className="text-center mb-4" style={{ color: "#1a3c34", fontWeight: "bold" }}>Checkout</h1>
      {message && <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>{message.text}</Alert>}
      <Row className="justify-content-center">
        <Col md={12}>
          <Card className="shadow-sm mb-4" style={{ border: "1px solid #ecf0f1" }}>
            <Card.Body>
              <h4 className="mb-4" style={{ color: "#1a3c34" }}>Order Summary</h4>
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <Row key={item.id} className="mb-3 align-items-center">
                    <Col xs={3} md={2}>
                      <Card.Img
                        src={item.image}
                        alt={item.title}
                        style={{ width: "100%", height: "auto", borderRadius: "8px", border: "1px solid #ddd" }}
                      />
                    </Col>
                    <Col xs={9} md={10}>
                      <h5 style={{ color: "#1a3c34", fontSize: "1.1rem" }}>{item.title}</h5>
                      <p style={{ margin: "0", color: "#7f8c8d" }}><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                      <p style={{ margin: "0", color: "#7f8c8d" }}><strong>Quantity:</strong> {item.quantity}</p>
                      <p style={{ margin: "0", color: "#7f8c8d" }}>
                        <strong>Color:</strong>{" "}
                        <span
                          style={{
                            backgroundColor: isValidCSSColor(item.color) ? item.color : "#f5f5f5",
                            color: isValidCSSColor(item.color) && (item.color === "white" || item.color === "yellow") ? "#000" : "#fff",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            display: "inline-block",
                            minWidth: "50px",
                          }}
                        >
                          {item.color}
                        </span>
                      </p>
                      <p style={{ margin: "0", color: "#e74c3c" }}><strong>Total:</strong> ${(item.price * item.quantity).toFixed(2)}</p>
                    </Col>
                  </Row>
                ))
              ) : (
                <p className="text-center" style={{ color: "#7f8c8d" }}>No items in your cart.</p>
              )}


              <hr style={{ borderColor: "#ecf0f1" }} />
              <h4 className="text-end" style={{ color: "#e74c3c" }}>Grand Total: ${totalPrice}</h4>
            </Card.Body>
          </Card>

          

          <Card className="shadow-sm mb-4" style={{ border: "1px solid #ecf0f1" }}>
            <Card.Body>
              <h4 className="mb-4" style={{ color: "#1a3c34" }}>Shipping Information</h4>
              <Form>
                {[
                  { id: "name", label: "Full Name", placeholder: "Enter your full name" },
                  { id: "address", label: "Address", placeholder: "Enter your address" },
                  { id: "city", label: "City", placeholder: "Enter your city" },
                  { id: "postalCode", label: "Postal Code", placeholder: "Enter postal code" },
                  { id: "country", label: "Country", placeholder: "Enter your country" },
                ].map((field) => (
                  <Form.Group key={field.id} className="mb-3" controlId={field.id}>
                    <Form.Label style={{ color: "#1a3c34" }}>{field.label}</Form.Label>
                    <Form.Control
                      type="text"
                      name={field.id}
                      value={shippingInfo[field.id]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      required={field.id !== "postalCode" && field.id !== "country"}
                      style={{ borderColor: "#bdc3c7", transition: "border-color 0.3s ease" }}
                      onFocus={(e) => (e.target.style.borderColor = "#16a085")}
                      onBlur={(e) => (e.target.style.borderColor = "#bdc3c7")}
                    />
                  </Form.Group>
                ))}
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4" style={{ border: "1px solid #ecf0f1" }}>
            <Card.Body>
              <h4 className="mb-4" style={{ color: "#1a3c34" }}>Payment</h4>
              <div id="paypal-button-container" style={{ position: "relative" }}>
                {loading && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}
              </div>
              {!paypalLoaded && !message && (
                <p className="text-center" style={{ color: "#7f8c8d" }}>Loading PayPal...</p>
              )}
              <Button
                variant="outline-primary"
                className="w-100 mt-3"
                onClick={handleOrderConfirmation}
                disabled={loading || parseFloat(totalPrice) <= 0}
                style={{ borderColor: "#3498db", color: "#3498db", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = "#3498db"; e.target.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#3498db"; }}
              >
                Confirm Order (Cash on Delivery)
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;