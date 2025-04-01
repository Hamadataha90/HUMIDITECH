// app/api/product-details/route.js
const SHOPIFY_API_BASE = "https://humidityzone.myshopify.com/admin/api/2023-10";
const SHOPIFY_HEADERS = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API_ACCESS_TOKEN,
};

// راوت لجلب التفاصيل التقيلة (body_html, images, metafields)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Product ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // جلب body_html و images من المنتج
    const productResponse = await fetch(
      `${SHOPIFY_API_BASE}/products/${id}.json?fields=body_html,images`,
      {
        method: "GET",
        headers: SHOPIFY_HEADERS,
      }
    );

    if (!productResponse.ok) throw new Error(`Failed to fetch product details: ${productResponse.status}`);

    const productData = await productResponse.json();
    if (!productData.product) throw new Error("Product not found");

    // جلب الـ metafields
    const metafieldsResponse = await fetch(
      `${SHOPIFY_API_BASE}/products/${id}/metafields.json`,
      {
        method: "GET",
        headers: SHOPIFY_HEADERS,
      }
    );

    let metafields = [];
    if (metafieldsResponse.ok) {
      const metaData = await metafieldsResponse.json();
      metafields = metaData.metafields || [];
    }

    // تجميع البيانات في response واحد
    const responseData = {
      body_html: productData.product.body_html,
      images: productData.product.images,
      metafields: metafields,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Shopify API Error in Product Details Route:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
