export const product = {
  brandName: "TsewangBista Shoes",
  name: "Shoes",
  headline: "Good Shoes. Great Prices.",
  subHeadline: "Get the shoes you love without spending too much.",
  description: "Good shoes, fair prices, and styles you'll love. Find your next pair today without spending more than you need to.",
  regularPrice: 5000,
  offerPrice: 3900,
  deliveryFee: 0,
  maxQuantity: 99,
  currency: "Rs.",
  images: ["/products/shoe-1.png", "/products/shoe-2.png", "/products/shoe-3.png", "/products/shoe-4.png"],
  benefits: ["Comfortable fit", "Durable quality", "Lightweight design", "Stylish look", "Fair price", "Cash on Delivery"],
  testimonials: [
    "Very comfortable and great quality. I wear them every day!",
    "Excellent shoes for the price. Stylish and durable.",
    "Lightweight, comfortable, and perfect for daily use.",
    "The fit is perfect, and the material feels premium.",
    "Fast delivery and the shoes look even better in person."
  ],
  faqs: [
    ["Are the shoes true to size?", "Yes, they fit true to standard sizing."],
    ["What material are the shoes made from?", "They are made from high-quality, durable materials."],
    ["Are they comfortable for daily wear?", "Yes, they are designed for all-day comfort."],
    ["Can I use them for walking?", "Yes, they are suitable for walking and everyday activities."],
    ["How do I clean the shoes?", "Wipe with a damp cloth and let them air dry."],
    ["Do you offer different sizes?", "Yes, multiple sizes are available."],
    ["How long does shipping take?", "Delivery times depend on your location and shipping method."]
  ]
} as const;

export function formatMoney(amount: number) {
  return `${product.currency} ${amount.toLocaleString("en-NP")}`;
}
