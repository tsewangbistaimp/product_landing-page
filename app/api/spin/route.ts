import { NextResponse } from "next/server";
import { calculateDiscountPricing, createSpinDiscount, spinRequestSchema } from "@/lib/discount";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const spinInput = spinRequestSchema.parse(await request.json());
    const { record, isDuplicate, cooldownUntil } = await createSpinDiscount(spinInput);

    if (!record) {
      return NextResponse.json(
        {
          ok: false,
          isDuplicate,
          cooldownUntil,
          error: `You already used Spin & Win recently. You can spin again after ${new Date(cooldownUntil || Date.now()).toLocaleString()}.`
        },
        { status: 429 }
      );
    }

    const pricing = calculateDiscountPricing(1, record.discountPercent);

    return NextResponse.json({
      ok: true,
      isDuplicate,
      cooldownUntil,
      discount: {
        code: record.code,
        percent: record.discountPercent,
        label: `${record.discountPercent}% OFF`,
        shoeSize: record.shoeSize,
        originalTotal: pricing.originalTotal,
        discountAmount: pricing.discountAmount,
        finalTotal: pricing.finalTotal,
        status: record.status,
        nextEligibleAt: record.nextEligibleAt
      }
    });
  } catch (error) {
    console.error("Spin discount failed", error);
    return NextResponse.json({ error: "Spin failed. Please check your details and try again." }, { status: 400 });
  }
}
