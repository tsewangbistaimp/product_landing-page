import { NextResponse } from "next/server";
import { orderSchema, saveOrderToGoogleSheet, sendOrderEmails, validateOrderPricing } from "@/lib/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const order = orderSchema.parse(await request.json());

    if (!(await validateOrderPricing(order))) {
      return NextResponse.json({ error: "Order pricing does not match the product offer." }, { status: 400 });
    }

    try {
      await saveOrderToGoogleSheet(order);
    } catch (error) {
      console.error("Google Sheets order save failed", error);
      return NextResponse.json({ error: "Order submission failed while saving to Google Sheets. Please contact support." }, { status: 500 });
    }

    try {
      await sendOrderEmails(order);
    } catch (error) {
      console.error("Order email notification failed", error);
      return NextResponse.json({ error: "Order submission failed while sending email notifications. Please contact support." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Order submission failed", error);
    return NextResponse.json({ error: "Order submission failed. Please check your details and try again." }, { status: 500 });
  }
}
