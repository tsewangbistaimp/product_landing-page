import { google } from "googleapis";
import nodemailer from "nodemailer";
import { z } from "zod";
import { formatMoney, product } from "./product";

export const orderSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  location: z.string().min(5),
  productName: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(product.maxQuantity),
  pricePerPiece: z.coerce.number().positive(),
  totalPrice: z.coerce.number().positive()
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
    range: `${sheetName}!A:J`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[new Date().toISOString(), order.fullName, order.phone, order.email, order.location, order.productName, order.quantity, order.pricePerPiece, order.totalPrice, "Cash On Delivery"]]
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

  const headerRange = `${sheetName}!A1:J1`;
  const expectedHeader = ["Submitted At", "Full Name", "Phone", "Email", "Location", "Product", "Quantity", "Price Per Piece", "Total Transaction", "Payment Method"];
  const header = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const currentHeader = header.data.values?.[0] || [];

  if (!header.data.values?.length || currentHeader[8] !== "Total Transaction") {
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
  return `
    <div style="font-family:Arial,sans-serif;color:#17221c;line-height:1.6">
      <h2 style="color:#175633">${heading}</h2>
      <p><strong>Product:</strong> ${order.productName}</p>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Price per piece:</strong> ${formatMoney(order.pricePerPiece)}</p>
      <p><strong>Total price:</strong> ${formatMoney(order.totalPrice)}</p>
      <p><strong>Payment method:</strong> Cash On Delivery</p>
      <hr />
      <p><strong>Name:</strong> ${order.fullName}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Location:</strong> ${order.location}</p>
    </div>
  `;
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
