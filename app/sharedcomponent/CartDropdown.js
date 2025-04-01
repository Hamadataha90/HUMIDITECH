"use client";

import { useMemo } from "react";
import {
  Dropdown,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Link from "next/link";

const CartDropdown = ({
  cartItems,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  removeAllItems,
  showCart,
  setShowCart,
  cartCount,
}) => {
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <Dropdown show={showCart} onToggle={(isOpen) => setShowCart(isOpen)} align="end">
      <Dropdown.Toggle
        as={Button}
        variant="outline-dark"
        className="position-relative"
        onClick={() => setShowCart(!showCart)}
        style={{
          borderColor: "#16a085",
          color: "#16a085",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#16a085";
          e.target.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
          e.target.style.color = "#16a085";
        }}
      >
        🛒 Cart
        {cartCount > 0 && (
          <Badge
            bg="danger"
            className="position-absolute top-0 start-100 translate-middle rounded-circle"
            style={{ fontSize: "0.7rem", padding: "0.3em 0.5em", backgroundColor: "#e74c3c" }}
          >
            {cartCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          minWidth: "400px",
          maxHeight: "500px",
          overflowY: "auto",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff",
          border: "1px solid #ecf0f1",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item, index) => (
              <Dropdown.Item
                key={index}
                as="div"
                className="d-flex align-items-center mb-3 p-3"
                style={{
                  borderBottom: index < cartItems.length - 1 ? "1px solid #ecf0f1" : "none",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f6f5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginRight: "20px",
                    border: "1px solid #ddd",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#1a3c34" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>
                    Color: <span style={{ textTransform: "capitalize" }}>{item.color}</span>
                  </div>
                  <div className="d-flex align-items-center mt-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={(e) => decreaseQuantity(item.id, e)}
                      style={{
                        padding: "2px 10px",
                        borderColor: "#bdc3c7",
                        color: "#1a3c34",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#bdc3c7";
                        e.target.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#1a3c34";
                      }}
                    >
                      -
                    </Button>
                    <span style={{ margin: "0 12px", color: "#1a3c34", fontWeight: "500" }}>
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={(e) => increaseQuantity(item.id, e)}
                      style={{
                        padding: "2px 10px",
                        borderColor: "#bdc3c7",
                        color: "#1a3c34",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#bdc3c7";
                        e.target.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#1a3c34";
                      }}
                    >
                      +
                    </Button>
                  </div>
                  <div style={{ fontSize: "1rem", color: "#e74c3c", marginTop: "8px" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                <OverlayTrigger placement="top" overlay={<Tooltip>Remove this item</Tooltip>}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    style={{
                      marginLeft: "15px",
                      borderColor: "#e74c3c",
                      color: "#e74c3c",
                      transition: "all 0.3s ease",
                    }}
                    onClick={(e) => removeItem(item.id, e)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#e74c3c";
                      e.target.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "#e74c3c";
                    }}
                  >
                    ✕
                  </Button>
                </OverlayTrigger>
              </Dropdown.Item>
            ))}
            <Dropdown.Divider style={{ borderColor: "#ecf0f1", margin: "10px 0" }} />
            <Dropdown.Item as="div" className="p-2">
              <div className="d-flex justify-content-between mb-3">
                <span style={{ fontWeight: "bold", color: "#1a3c34", fontSize: "1.1rem" }}>
                  Total:
                </span>
                <span style={{ fontWeight: "bold", color: "#e74c3c", fontSize: "1.1rem" }}>
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <OverlayTrigger placement="top" overlay={<Tooltip>Clear your cart</Tooltip>}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => removeAllItems(e)}
                    style={{
                      borderColor: "#e74c3c",
                      color: "#e74c3c",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#e74c3c";
                      e.target.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "#e74c3c";
                    }}
                  >
                    Remove All
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Complete your purchase</Tooltip>}>
                  <Button
                    as={Link}
                    href="/checkout"
                    variant="success"
                    size="sm"
                    style={{
                      backgroundColor: "#16a085",
                      borderColor: "#16a085",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#138d75")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#16a085")}
                  >
                    Proceed to Checkout
                  </Button>
                </OverlayTrigger>
              </div>
            </Dropdown.Item>
          </>
        ) : (
          <Dropdown.Item as="div" className="text-center p-4">
            <span style={{ color: "#7f8c8d", fontSize: "1rem" }}>Your cart is empty</span>
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CartDropdown;