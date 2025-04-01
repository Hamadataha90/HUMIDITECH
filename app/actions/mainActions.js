// app/actions/mainActions.js
import { cache } from "react";

export const fetchFeaturedProducts = cache(async () => {
  try {
    console.time("Fetch Featured Products");

    const response = await fetch("http://localhost:3000/api/products?featured=true", {
      method: "GET",
      next: { revalidate: 300 }, // 5 دقايق - نفس الـ revalidate بتاعك
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to fetch featured products: ${response.status} - ${response.statusText}`);
      console.error(`Error details:`, errorBody);
      throw new Error(`Failed to fetch featured products: ${response.statusText}`);
    }

    console.time("Parse JSON");
    const data = await response.json();
    console.timeEnd("Parse JSON");

    if (!data || !Array.isArray(data)) {
      console.warn("Invalid featured products data received", data);
      return [];
    }

    console.timeEnd("Fetch Featured Products");

    return data;
  } catch (error) {
    console.error("API Route Error:", error.message);
    return [];
  }
});