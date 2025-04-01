// app/api/cart/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { cart } = await req.json(); // استلام السلة من العميل

    // هنا يمكنك تخزين السلة في قاعدة بيانات أو حتى في الذاكرة المؤقتة
    const serializedCart = JSON.stringify(cart);
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", serializedCart); // تخزين السلة في localStorage
    }

    return NextResponse.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
