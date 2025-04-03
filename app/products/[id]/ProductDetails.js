// components/ProductDetails.js
"use client";
import { useState, useEffect } from "react";
import { Container, Row, Col, Badge, Button, Image, Spinner } from "react-bootstrap";
import { GeoAltFill } from "react-bootstrap-icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProductDetails({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || {});
  const [mainImage, setMainImage] = useState("");
  const [images, setImages] = useState([]); // State للـ images من الراوت التاني
  const [quantity, setQuantity] = useState(1);
  const [cleanDescription, setCleanDescription] = useState("");
  const [metafields, setMetafields] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true); // Loading للتفاصيل والصور

  const router = useRouter();

  const PRICE_MULTIPLIER = 2;
  const COMPARE_PRICE_MULTIPLIER = 2.0;

  const originalPrice = parseFloat(selectedVariant.price || 0);
  const adjustedPrice = originalPrice * PRICE_MULTIPLIER;
  const adjustedComparePrice = adjustedPrice * COMPARE_PRICE_MULTIPLIER;

  // Fetch التفاصيل (images, body_html, metafields) من الراوت التاني
  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const response = await fetch(`/api/product-details?id=${product.id}`);
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();

        // تنظيف الـ body_html
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.body_html || "", "text/html");
        doc.querySelectorAll("style, script").forEach((el) => el.remove());
        doc.querySelectorAll("img").forEach((img) => {
          img.setAttribute("loading", "lazy");
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          img.style.display = "block";
          img.style.margin = "10px auto";
        });
        setCleanDescription(doc.body.innerHTML);
        setImages(data.images || []);
        setMainImage(data.images[0]?.src || ""); // أول صورة كـ main image
        setMetafields(data.metafields || []);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setCleanDescription("Failed to load product description.");
      } finally {
        setLoadingDetails(false);
      }
    }
    fetchProductDetails();
  }, [product.id]);

  useEffect(() => {
    if (images.length > 0) {
      const matchedImage = images.find((img) =>
        img.variant_ids?.includes(Number(selectedVariant.id))
      );
      setMainImage(matchedImage ? matchedImage.src : images[0]?.src);
    }
  }, [selectedVariant, images]);

  useEffect(() => {
    const handleResize = () => {
      setIsSticky(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleVariantChange = (e) => {
    const selected = product.variants.find((v) => String(v.id) === e.target.value);
    setSelectedVariant(selected);
  };

  const handleThumbnailClick = (img) => {
    setMainImage(img.src);
    if (img.variant_ids?.length) {
      const matchedVariantId = img.variant_ids[0];
      const newVariant = product.variants.find((v) => v.id === matchedVariantId);
      setSelectedVariant(newVariant);
    }
  };

  const isValidCSSColor = (color) => {
    const s = new Option().style;
    s.color = color;
    return s.color !== "";
  };

  const normalizeColor = (color) => {
    const colorMap = {
      kaki: "khaki",
      grey: "gray",
      beige: "beige",
      navy: "navy",
    };
    const lowerColor = color.toLowerCase();
    return isValidCSSColor(lowerColor) ? lowerColor : (colorMap[lowerColor] || "#f5f5f5");
  };





  const handleAddToCart = async () => {
    try {
      const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
  
      if (!selectedVariant?.id || !quantity || !adjustedPrice || !mainImage) {
        throw new Error("Missing product information.");
      }
  
      const color = normalizeColor(selectedVariant.title.split(" ")[0]);
  
      const newItem = {
        id: selectedVariant.id,
        quantity: parseInt(quantity, 10),
        title: selectedVariant.title,
        price: parseFloat(adjustedPrice),
        image: mainImage,
        color: color,
      };
  
      const itemIndex = currentCart.findIndex((item) => item.id === newItem.id);
      if (itemIndex > -1) {
        currentCart[itemIndex].quantity += newItem.quantity;
      } else {
        currentCart.push(newItem);
      }
  
      // إرسال السلة إلى API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart: currentCart }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update cart");
      }
  
      const data = await response.json();
      console.log(data.message);  // رسالة نجاح من الـ API
  
      localStorage.setItem("cart", JSON.stringify(currentCart));  // تحديث السلة في localStorage
  
      const notification = document.createElement("div");
      notification.textContent = "Added to Cart!";
      notification.style.cssText = `
        position: fixed; top: 58px; right: 170px; background: #16a085; color: white;
        padding: 10px 20px; border-radius: 5px; z-index: 1000;
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    } catch (error) {
      const errorNotification = document.createElement("div");
      errorNotification.textContent = "Error adding to cart. Please try again.";
      errorNotification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #e74c3c; color: white;
        padding: 10px 20px; border-radius: 5px; z-index: 1000;
      `;
      document.body.appendChild(errorNotification);
      setTimeout(() => errorNotification.remove(), 2000);
      console.error("Error in handleAddToCart:", error.message);
    }
  };
  

  // const handleAddToCart = () => {
  //   try {
  //     const currentCart = JSON.parse(localStorage.getItem("cart")) || [];

  //     if (!selectedVariant?.id || !quantity || !adjustedPrice || !mainImage) {
  //       throw new Error("Missing product information.");
  //     }

  //     const color = normalizeColor(selectedVariant.title.split(" ")[0]);

  //     const newItem = {
  //       id: selectedVariant.id,
  //       quantity: parseInt(quantity, 10),
  //       title: selectedVariant.title,
  //       price: parseFloat(adjustedPrice),
  //       image: mainImage,
  //       color: color,
  //     };

  //     const itemIndex = currentCart.findIndex((item) => item.id === newItem.id);
  //     if (itemIndex > -1) {
  //       currentCart[itemIndex].quantity += newItem.quantity;
  //     } else {
  //       currentCart.push(newItem);
  //     }

  //     localStorage.setItem("cart", JSON.stringify(currentCart));

  //     const notification = document.createElement("div");
  //     notification.textContent = "Added to Cart!";
  //     notification.style.cssText = `
  //       position: fixed; top: 58px; right: 170px; background: #16a085; color: white;
  //       padding: 10px 20px; border-radius: 5px; z-index: 1000;
  //     `;
  //     document.body.appendChild(notification);
  //     setTimeout(() => notification.remove(), 2000);
  //   } catch (error) {
  //     const errorNotification = document.createElement("div");
  //     errorNotification.textContent = "Error adding to cart. Please try again.";
  //     errorNotification.style.cssText = `
  //       position: fixed; top: 20px; right: 20px; background: #e74c3c; color: white;
  //       padding: 10px 20px; border-radius: 5px; z-index: 1000;
  //     `;
  //     document.body.appendChild(errorNotification);
  //     setTimeout(() => errorNotification.remove(), 2000);
  //     console.error("Error in handleAddToCart:", error.message);
  //   }
  // };




  const handleCheck = () => {
    try {
      const currentCart = JSON.parse(localStorage.getItem("cart")) || [];

      if (!selectedVariant?.id || !quantity || !adjustedPrice || !mainImage) {
        throw new Error("Missing product information.");
      }

      const color = normalizeColor(selectedVariant.title.split(" ")[0]);

      const newItem = {
        id: selectedVariant.id,
        quantity: parseInt(quantity, 10),
        title: selectedVariant.title,
        price: parseFloat(adjustedPrice),
        image: mainImage,
        color: color,
      };

      const itemIndex = currentCart.findIndex((item) => item.id === newItem.id);
      if (itemIndex > -1) {
        currentCart[itemIndex].quantity += newItem.quantity;
      } else {
        currentCart.push(newItem);
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));
      router.push("/checkout");
    } catch (error) {
      alert("Error proceeding to checkout. Please try again.");
      console.error("Error in handleCheck:", error);
    }
  };

  if (!product) {
    return <div>Product not found</div>;
  }




  
  return (
    <Container fluid className="mt-5">
      <Row className="align-items-start">
        <Col xs={12} md={4} className="d-block" style={isSticky ? { position: "sticky", top: "0", height: "100vh", overflowY: "auto", maxHeight: "100vh" } : {}}>
          <div className="text-center">
            <div style={{ width: "100%", maxHeight: "800px", overflow: "hidden" }}>
              {loadingDetails ? (
                <div style={{ height: "500px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Image src={mainImage} alt="Product Image" fluid style={{ width: "100%", objectFit: "fill", maxHeight: "500px", borderRadius: "50px" }} loading="lazy" />
              )}
            </div>
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-3" style={{ maxWidth: "100%" }}>
              {loadingDetails ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                images.map((img) => (
                  <img
                    key={img.id}
                    src={img.src}
                    alt="Product Thumbnail"
                    className={`thumbnail ${mainImage === img.src ? "border border-primary" : ""}`}
                    style={{ width: "60px", height: "60px", objectFit: "cover", cursor: "pointer", borderRadius: "8px", transition: "border 0.2s ease-in-out", padding: "5px" }}
                    onClick={() => handleThumbnailClick(img)}
                    loading="lazy"
                  />
                ))
              )}
            </div>
          </div>
        </Col>

        <Col md={6} xs={12} className="px-4 py-2 col-details">
          <h1 className="mb-2">{product.title}</h1>
          <Badge bg="secondary" className="mb-3">{product.product_type || "General"}</Badge>

          <div className="mb-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <p className="fs-4 fw-bold text-primary m-0">{adjustedPrice.toFixed(2)}</p>
              <p className="fs-5 text-muted text-decoration-line-through m-0">
                {adjustedComparePrice.toFixed(2)}
              </p>
              <Badge bg="success" className="align-self-center">50% OFF</Badge>
            </div>

            {metafields.length > 0 && (
              <div className="d-flex align-items-center gap-2 bg-light border rounded px-3 py-1">
                <GeoAltFill size={20} className="text-primary" />
                <p className="fw-semibold text-dark fs-6 m-0">
                  SHIP FROM: {metafields.find(m => m.key === "shipping_location")?.value || "Unknown"}
                </p>
              </div>
            )}
          </div>

          <div className="d-flex align-items-baseline gap-5 mb-3">
            {product.inventory && (
              <p className={`fw-semibold ${product.inventory.includes("Out of Stock") ? "text-danger" : "text-success"}`} style={{ fontSize: "1rem", whiteSpace: "nowrap", minHeight: "24px", display: "flex", alignItems: "center" }}>
                {product.inventory}
              </p>
            )}
            <select className="form-select" value={selectedVariant.id} onChange={handleVariantChange}>
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>{variant.title}</option>
              ))}
            </select>
          </div>
          <div className="d-flex align-items-center gap-3 mt-4">
            <button type="button" className="btn btn-outline-danger" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>-</button>
            <span className="text-success fw-bold">{quantity}</span>
            <button type="button" className="btn btn-outline-danger" onClick={() => setQuantity((prev) => prev + 1)}>+</button>
            <motion.span className="text-primary fw-bold ms-3" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: "0.3", ease: "easeOut" }}>
              Total: ${(adjustedPrice * quantity).toFixed(2)}
            </motion.span>
          </div>
          <div className="d-flex justify-content-between gap-3 mt-4">
            <Button onClick={handleAddToCart} className="flex-grow-1" size="lg">Add to Cart 🛒</Button>
            <Button onClick={handleCheck} variant="warning" className="flex-grow-1" size="lg">Checkout 🛍️</Button>
          </div>

          <div className="mt-5 product-description">
            <div className="border p-3 rounded bg-light">
              <h2 className="text-center mt-2" style={{ fontWeight: "bold", fontSize: "1.5rem", color: "#ff6600", textTransform: "uppercase", letterSpacing: "1px" }}>
                Loved by Thousands, Trusted by You!
              </h2>
              {loadingDetails ? (
                <p>Loading description...</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: cleanDescription }} />
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
