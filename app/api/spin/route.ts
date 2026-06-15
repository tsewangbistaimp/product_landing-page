import { NextResponse } from "next/server";
import { calculateDiscountPricing, createSpinDiscount, spinRequestSchema } from "@/lib/discount";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const spinInput = spinRequestSchema.parse(await request.json());
    const { record, isDuplicate } = await createSpinDiscount(spinInput);
    const pricing = calculateDiscountPricing(1, record.discountPercent);

    return NextResponse.json({
      ok: true,
      isDuplicate,
      discount: {
        code: record.code,
        percent: record.discountPercent,
        label: `${record.discountPercent}% OFF`,
        shoeSize: record.shoeSize,
        originalTotal: pricing.originalTotal,
        discountAmount: pricing.discountAmount,
        finalTotal: pricing.finalTotal
      }
    });
  } catch (error) {
    console.error("Spin discount failed", error);
    return NextResponse.json({ error: "Spin failed. Please check your details and try again." }, { status: 400 });
  }
}
