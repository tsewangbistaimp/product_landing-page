import { google } from "googleapis";
import nodemailer from "nodemailer";
import { z } from "zod";
import { calculateDiscountPricing, findSpinByCode } from "./discount";
import { formatMoney, product } from "./product";

export const orderSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  location: z.string().min(5),
  shoeSize: z.string().optional().default(""),
  productName: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(product.maxQuantity),
  pricePerPiece: z.coerce.number().positive(),
  originalTotal: z.coerce.number().positive(),
  discountCode: z.string().optional().default(""),
  discountPercent: z.coerce.number().min(0).max(100).optional().default(0),
  discountAmount: z.coerce.number().min(0).optional().default(0),
  totalPrice: z.coerce.number().min(0)
});

export type OrderPayload = z.infer<typeof orderSchema>;

function requireEnv(name: string) {
  const value = cleanEnv(process.env[name]);
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

function cleanEnv(value: string | undefined) {
  if (!value) return "";

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizedPrivateKey() {
  return requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n").trim();
}

export async function saveOrderToGoogleSheet(order: OrderPayload) {
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const sheetName = process.env.GOOGLE_SHEET_TAB_NAME || "Orders";
  const auth = new google.auth.JWT({
    email: requireEnv("GOOGLE_CLIENT_EMAIL"),
    key: normalizedPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  const sheets = google.sheets({ version: "v4", auth });

  await ensureSheetReady(sheets, spreadsheetId, sheetName);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:P`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        new Date().toISOString(),
        order.fullName,
        order.phone,
        order.email,
        order.location,
        order.productName,
        order.quantity,
        order.pricePerPiece,
        order.originalTotal,
        order.discountPercent,
        order.discountAmount,
        order.totalPrice,
        order.discountCode,
        order.shoeSize,
        "Cash On Delivery",
        order.discountCode ? "Spin and Win" : ""
      ]]
    }
  });
}

async function ensureSheetReady(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string, sheetName: string) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === sheetName);

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] }
    });
  }

  const headerRange = `${sheetName}!A1:P1`;
  const expectedHeader = [
    "Submitted At",
    "Full Name",
    "Phone",
    "Email",
    "Location",
    "Product",
    "Quantity",
    "Price Per Piece",
    "Original Total",
    "Discount Percent",
    "Discount Amount",
    "Total Transaction",
    "Discount Code",
    "Shoe Size",
    "Payment Method",
    "Discount Source"
  ];
  const header = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const currentHeader = header.data.values?.[0] || [];

  if (!header.data.values?.length || currentHeader[11] !== "Total Transaction") {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [expectedHeader]
      }
    });
  }
}

function orderHtml(order: OrderPayload, heading: string) {
  const discountBlock = order.discountCode
    ? `
      <p><strong>Original total:</strong> ${formatMoney(order.originalTotal)}</p>
      <p><strong>Spin discount:</strong> ${order.discountPercent}% OFF (${order.discountCode})</p>
      <p><strong>Discount amount:</strong> -${formatMoney(order.discountAmount)}</p>
      <p><strong>Final total:</strong> ${formatMoney(order.totalPrice)}</p>
    `
    : `<p><strong>Total price:</strong> ${formatMoney(order.totalPrice)}</p>`;

  return `
    <div style="font-family:Arial,sans-serif;color:#17221c;line-height:1.6">
      <h2 style="color:#175633">${heading}</h2>
      <p><strong>Product:</strong> ${order.productName}</p>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Price per piece:</strong> ${formatMoney(order.pricePerPiece)}</p>
      ${discountBlock}
      <p><strong>Payment method:</strong> Cash On Delivery</p>
      <hr />
      <p><strong>Name:</strong> ${order.fullName}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      ${order.shoeSize ? `<p><strong>Shoe size:</strong> ${order.shoeSize}</p>` : ""}
      <p><strong>Location:</strong> ${order.location}</p>
    </div>
  `;
}

export async function validateOrderPricing(order: OrderPayload) {
  if (order.productName !== product.name || order.pricePerPiece !== product.offerPrice) {
    return false;
  }

  let verifiedDiscountPercent = 0;
  if (order.discountCode) {
    const spinRecord = await findSpinByCode(order.discountCode);
    if (!spinRecord) return false;
    if (spinRecord.status !== "active") return false;
    if (spinRecord.email.toLowerCase() !== order.email.toLowerCase()) return false;
    if (spinRecord.whatsapp.replace(/[^\d+]/g, "") !== order.phone.replace(/[^\d+]/g, "")) return false;
    verifiedDiscountPercent = spinRecord.discountPercent;
  }

  const pricing = calculateDiscountPricing(order.quantity, verifiedDiscountPercent);
  return (
    order.originalTotal === pricing.originalTotal &&
    order.discountPercent === verifiedDiscountPercent &&
    order.discountAmount === pricing.discountAmount &&
    order.totalPrice === pricing.finalTotal
  );
}

export async function sendOrderEmails(order: OrderPayload) {
  const transport = nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port: Number(requireEnv("SMTP_PORT")),
    secure: cleanEnv(process.env.SMTP_SECURE) === "true",
    auth: {
      user: requireEnv("SMTP_USER"),
      pass: requireEnv("SMTP_PASS").replace(/\s/g, "")
    }
  });
  const from = cleanEnv(process.env.CUSTOMER_EMAIL_FROM) || requireEnv("SMTP_USER");
  const replyTo = cleanEnv(process.env.CUSTOMER_REPLY_TO) || requireEnv("SMTP_USER");
  const notificationEmail = cleanEnv(process.env.ORDER_NOTIFICATION_EMAIL) || requireEnv("SMTP_USER");

  await Promise.all([
    transport.sendMail({
      from,
      replyTo,
      to: notificationEmail,
      subject: `New COD order - ${order.productName}`,
      html: orderHtml(order, "New Cash On Delivery Order")
    }),
    transport.sendMail({
      from,
      replyTo,
      to: order.email,
      subject: `Order received - ${product.brandName}`,
      html: `${orderHtml(order, "Thank you for your order!")}<p>Our sales representative will call you soon to confirm your order.</p>`
    })
  ]);
}
