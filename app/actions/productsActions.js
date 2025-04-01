"use server";

// استخدام متغير البيئة لتحديد رابط الـ API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// جلب منتج محدد بناءً على الـ ID من الـ API Route (بدون body_html أو metafields)
export async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_URL}/api/products?id=${id}`, {
      method: "GET",
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) throw new Error(`Failed to fetch product: ${response.status} - ${response.statusText}`);

    const data = await response.json();
    if (!data) throw new Error("Product not found");

    const inventoryItemId = data.variants?.[0]?.inventory_item_id;
    const inventory = inventoryItemId ? await fetchInventory(inventoryItemId) : "No Inventory Info";

    return { ...data, inventory }; // مفيش metafields هنا
  } catch (error) {
    console.error("API Route Error (fetchProductById):", error);
    throw error;
  }
}

// جلب كل المنتجات من الـ API Route (بدون body_html أو metafields)
export async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products`, {
      method: "GET",
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) throw new Error(`Failed to fetch products: ${response.status} - ${response.statusText}`);

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid products data format");

    const productsWithDetails = await Promise.all(
      data.map(async (product) => {
        const inventoryItemId = product.variants?.[0]?.inventory_item_id;
        const inventory = inventoryItemId ? await fetchInventory(inventoryItemId) : "No Inventory Info";

        return { ...product, inventory }; // مفيش metafields هنا
      })
    );

    return productsWithDetails;
  } catch (error) {
    console.error("API Route Error (fetchProducts):", error);
    return [];
  }
}

// جلب المخزون مع تحسين الكاش
export async function fetchInventory(inventoryItemId) {
  try {
    const response = await fetch(
      `https://humidityzone.myshopify.com/admin/api/2023-10/inventory_levels.json?inventory_item_ids=${inventoryItemId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
        },
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );

    if (!response.ok) throw new Error(`Failed to fetch inventory: ${response.status} - ${response.statusText}`);

    const data = await response.json();
    return data.inventory_levels?.[0]?.available > 0
      ? `In Stock (${data.inventory_levels[0].available})`
      : "Out of Stock";
  } catch (error) {
    console.error("Shopify API Error (fetchInventory):", error);
    return "Stock Info Unavailable";
  }
}
