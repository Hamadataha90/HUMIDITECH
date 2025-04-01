"use server";
import axios from "axios";

export async function createPaypalPayment(amount, currency = "USD") {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error("PayPal credentials are missing. Check your .env file.");
  }

  try {
    const response = await axios.post(
      "https://api.sandbox.paypal.com/v1/payments/payment",
      {
        intent: "sale",
        payer: { payment_method: "paypal" },
        transactions: [
          {
            amount: { total: amount, currency: currency },
            description: "Payment via PayPal Sandbox",
          },
        ],
        redirect_urls: {
          return_url: "http://localhost:3000/success",
          cancel_url: "http://localhost:3000/cancel",
        },
      },
      {
        auth: {
          username: clientId,
          password: secret,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("PayPal API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to create PayPal payment. Check server logs for details."
    );
  }
}