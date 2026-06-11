import nextEnv from "@next/env";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import crypto from "node:crypto";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

function privateKey() {
  return required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n").trim();
}

async function testGoogleSheets() {
  const key = privateKey();
  crypto.createPrivateKey(key);
  const spreadsheetId = required("GOOGLE_SHEET_ID");
  const sheetName = process.env.GOOGLE_SHEET_TAB_NAME || "Orders";
  const auth = new google.auth.JWT({
    email: required("GOOGLE_CLIENT_EMAIL"),
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  const sheets = google.sheets({ version: "v4", auth });
  await ensureSheetReady(sheets, spreadsheetId, sheetName);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:J`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[new Date().toISOString(), "Integration Script Test", "9800000010", required("ORDER_NOTIFICATION_EMAIL"), "Integration test location", "Shoes", 1, 3900, 3900, "Cash On Delivery"]]
    }
  });
  console.log("Google Sheets: OK");
}

async function ensureSheetReady(sheets, spreadsheetId, sheetName) {
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

async function testEmail() {
  const transport = nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port: Number(required("SMTP_PORT")),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: required("SMTP_USER"), pass: required("SMTP_PASS") }
  });
  await transport.verify();
  await transport.sendMail({
    from: process.env.CUSTOMER_EMAIL_FROM || required("SMTP_USER"),
    replyTo: process.env.CUSTOMER_REPLY_TO || required("SMTP_USER"),
    to: required("ORDER_NOTIFICATION_EMAIL"),
    subject: "TsewangBista Shoes integration test",
    text: "Google/Gmail integration test from the COD funnel."
  });
  console.log("Gmail SMTP: OK");
}

const results = await Promise.allSettled([testGoogleSheets(), testEmail()]);
let failed = false;
for (const [index, result] of results.entries()) {
  const name = index === 0 ? "Google Sheets" : "Gmail SMTP";
  if (result.status === "rejected") {
    failed = true;
    console.error(`${name}: FAILED - ${result.reason?.message || result.reason}`);
  }
}
if (failed) process.exit(1);
console.log("All integrations: OK");
