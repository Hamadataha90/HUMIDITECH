// app/api/products/route.js
const SHOPIFY_API_BASE = "https://humidityzone.myshopify.com/admin/api/2023-10";
const SHOPIFY_HEADERS = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
};

// راوت لجلب البيانات الأساسية فقط (id, title, variants) من غير images
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const response = await fetch(
        `${SHOPIFY_API_BASE}/products/${id}.json?fields=id,title,variants`,
        { method: "GET", headers: SHOPIFY_HEADERS }
      );

      if (!response.ok) throw new Error(`Failed to fetch product: ${response.status}`);

      const data = await response.json();
      if (!data.product) throw new Error("Product not found");

      return new Response(JSON.stringify(data.product), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const response = await fetch(
        `${SHOPIFY_API_BASE}/products.json?fields=id,title,variants`,
        { method: "GET", headers: SHOPIFY_HEADERS }
      );

      if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error("Invalid products data format");

      return new Response(JSON.stringify(data.products), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Shopify API Error in Basic Products Route:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}