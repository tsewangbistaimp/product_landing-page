import crypto from "crypto";
import { google } from "googleapis";
import { z } from "zod";
import { product } from "./product";

export const shoeSizes = ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12"] as const;
export const discountPercents = [10, 20, 50, 75, 100] as const;

const spinSheetName = "SpinDiscounts";
const flodeskFormAction = "https://form.flodesk.com/forms/6a2b9acffa661184558e3528/submit";

export const spinRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  whatsapp: z.string().trim().min(7, "WhatsApp number is required."),
  shoeSize: z.enum(shoeSizes)
});

export type SpinRequest = z.infer<typeof spinRequestSchema>;

export type SpinRecord = SpinRequest & {
  code: string;
  discountPercent: number;
  createdAt: string;
  status: string;
};

export type DiscountPricing = {
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
};

function cleanEnv(value: string | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function requireEnv(name: string) {
  const value = cleanEnv(process.env[name]);
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

function normalizedPrivateKey() {
  return requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n").trim();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: requireEnv("GOOGLE_CLIENT_EMAIL"),
    key: normalizedPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ version: "v4", auth });
}

async function ensureSpinSheetReady(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === spinSheetName);

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: spinSheetName } } }] }
    });
  }

  const headerRange = `${spinSheetName}!A1:H1`;
  const expectedHeader = ["Created At", "Discount Code", "Full Name", "Email", "WhatsApp", "Shoe Size", "Won Discount Percent", "Status"];
  const header = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const currentHeader = header.data.values?.[0] || [];

  if (!header.data.values?.length || currentHeader[1] !== "Discount Code") {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [expectedHeader] }
    });
  }
}

function rowToSpinRecord(row: string[]): SpinRecord | null {
  const [createdAt, code, fullName, email, whatsapp, shoeSize, discountPercent, status] = row;
  if (!code || !email || !whatsapp || !shoeSize) return null;
  if (!shoeSizes.includes(shoeSize as (typeof shoeSizes)[number])) return null;

  return {
    createdAt,
    code,
    fullName,
    email,
    whatsapp,
    shoeSize: shoeSize as (typeof shoeSizes)[number],
    discountPercent: Number(discountPercent),
    status: status || "active"
  };
}

async function readSpinRows() {
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();
  await ensureSpinSheetReady(sheets, spreadsheetId);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${spinSheetName}!A2:H`
  });

  return (response.data.values || []) as string[][];
}

export async function findSpinByCode(code: string) {
  const rows = await readSpinRows();
  return rows.map(rowToSpinRecord).find((record) => record?.code === code) || null;
}

async function findExistingSpin(email: string, whatsapp: string) {
  const normalizedInputEmail = normalizeEmail(email);
  const normalizedInputPhone = normalizePhone(whatsapp);
  const rows = await readSpinRows();

  return (
    rows
      .map(rowToSpinRecord)
      .find((record) => {
        if (!record) return false;
        return normalizeEmail(record.email) === normalizedInputEmail || normalizePhone(record.whatsapp) === normalizedInputPhone;
      }) || null
  );
}

function drawDiscountPercent() {
  const roll = crypto.randomInt(1, 101);
  if (roll <= 50) return 10;
  if (roll <= 80) return 20;
  if (roll <= 92) return 50;
  if (roll <= 99) return 75;
  return 100;
}

function createDiscountCode(discountPercent: number) {
  return `TB-${discountPercent}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function calculateDiscountPricing(quantity: number, discountPercent = 0): DiscountPricing {
  const originalTotal = quantity * product.offerPrice + product.deliveryFee;
  const discountAmount = Math.min(originalTotal, Math.round((quantity * product.offerPrice * discountPercent) / 100));
  return {
    originalTotal,
    discountAmount,
    finalTotal: originalTotal - discountAmount
  };
}

export async function createSpinDiscount(input: SpinRequest) {
  const existing = await findExistingSpin(input.email, input.whatsapp);
  if (existing) {
    return { record: existing, isDuplicate: true };
  }

  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const sheets = getSheetsClient();
  await ensureSpinSheetReady(sheets, spreadsheetId);

  const discountPercent = drawDiscountPercent();
  const record: SpinRecord = {
    ...input,
    code: createDiscountCode(discountPercent),
    discountPercent,
    createdAt: new Date().toISOString(),
    status: "active"
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${spinSheetName}!A:H`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[record.createdAt, record.code, record.fullName, record.email, record.whatsapp, record.shoeSize, record.discountPercent, record.status]]
    }
  });

  await syncSpinLeadToFlodesk(record);

  return { record, isDuplicate: false };
}

async function syncSpinLeadToFlodesk(record: SpinRecord) {
  try {
    const formData = new URLSearchParams();
    formData.set("email", record.email);
    formData.set("firstName", record.fullName);
    formData.set("fields.whatsapp", record.whatsapp);
    formData.set("fields.country", record.shoeSize);
    formData.set("fields.facebook", `Won Discount: ${record.discountPercent}% OFF (${record.code})`);
    formData.set("confirm_email_address", "");

    await fetch(flodeskFormAction, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });
  } catch (error) {
    console.error("Flodesk spin lead sync failed", error);
  }
}
