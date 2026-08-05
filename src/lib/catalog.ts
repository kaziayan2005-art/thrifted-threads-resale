import type { Product } from "@/types";
import blouse from "@/assets/sketch-blouse.jpg";
import dress from "@/assets/sketch-dress.jpg";
import jacket from "@/assets/sketch-jacket.jpg";
import knit from "@/assets/sketch-knit.jpg";

/**
 * Demo catalogue. Every listing is single-unit inventory.
 * Illustrations stand in for the real garment photography that the admin
 * panel requires at publish time — no stock photography is used.
 */

interface Seed {
  name: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  occasion: Product["occasion"];
  condition: Product["condition"];
  originalPrice: number;
  price: number;
  fabric: string;
  description: string;
  image: string;
  flaws?: Product["flaws"];
  shoot?: Product["shoot"];
  bestSeller?: boolean;
}

const seeds: Seed[] = [
  {
    name: "Ivory Silk Camp Shirt",
    brand: "Sapphire",
    category: "Tops",
    size: "M",
    color: "Ivory",
    occasion: "Workwear",
    condition: "New with Tags",
    originalPrice: 12500,
    price: 4200,
    fabric: "100% mulberry silk",
    description:
      "A softly draping camp collar shirt that never left the studio rail. Tags intact, seams crisp.",
    image: blouse,
    bestSeller: true,
  },
  {
    name: "Charcoal Wide-Leg Trouser",
    brand: "Generation",
    category: "Bottoms",
    size: "L",
    color: "Charcoal",
    occasion: "Workwear",
    condition: "Gently Used",
    originalPrice: 8900,
    price: 2600,
    fabric: "Wool blend twill",
    description:
      "High-rise trousers with a clean break at the ankle. Worn through one season of desk days.",
    image: knit,
    flaws: [
      { label: "Hem wear", note: "Light fraying on the left inner hem, under 1cm." },
    ],
  },
  {
    name: "Indigo Denim Trucker",
    brand: "Levi's",
    category: "Outerwear",
    size: "S",
    color: "Indigo",
    occasion: "Everyday",
    condition: "Worn Once",
    originalPrice: 15000,
    price: 5400,
    fabric: "Rigid cotton denim",
    description:
      "Boxy trucker jacket, broken in exactly once. Hardware bright, indigo still deep.",
    image: jacket,
    bestSeller: true,
  },
  {
    name: "Olive Slip Dress",
    brand: "Khaadi",
    category: "Dresses",
    size: "S",
    color: "Olive",
    occasion: "Party",
    condition: "Photoshoot Sample",
    originalPrice: 11000,
    price: 3900,
    fabric: "Viscose satin",
    description:
      "Bias-cut slip that photographed for one lookbook morning and was never retailed.",
    image: dress,
    shoot: {
      campaign: "Late Light",
      season: "Autumn 2025",
      blurb:
        "Shot on a rooftop in Lahore at 6pm. This is the exact piece on the third spread — you can still see the pin marks we steamed out.",
    },
    bestSeller: true,
  },
  {
    name: "Black Cotton Poplin Shirt",
    brand: "Zara",
    category: "Tops",
    size: "M",
    color: "Black",
    occasion: "Workwear",
    condition: "Gently Used",
    originalPrice: 7500,
    price: 2200,
    fabric: "Cotton poplin",
    description: "A dependable black shirt, softened by a handful of washes.",
    image: blouse,
    flaws: [{ label: "Button", note: "Second button replaced with a close match." }],
  },
  {
    name: "Ecru Ribbed Knit",
    brand: "Uniqlo",
    category: "Knitwear",
    size: "M",
    color: "Ecru",
    occasion: "Everyday",
    condition: "Worn Once",
    originalPrice: 6800,
    price: 2400,
    fabric: "Extra fine merino",
    description: "Fine-gauge merino crew with a clean ribbed hem.",
    image: knit,
  },
  {
    name: "Terracotta Linen Kaftan",
    brand: "Generation",
    category: "Dresses",
    size: "L",
    color: "Terracotta",
    occasion: "Festive",
    condition: "Photoshoot Sample",
    originalPrice: 14500,
    price: 5200,
    fabric: "Washed linen",
    description: "Floor-skimming kaftan sampled for a festive campaign.",
    image: dress,
    shoot: {
      campaign: "Courtyard",
      season: "Eid 2025",
      blurb:
        "One of three colourways sampled; only this one made it in front of the camera.",
    },
  },
  {
    name: "Stone Utility Overshirt",
    brand: "COS",
    category: "Outerwear",
    size: "L",
    color: "Stone",
    occasion: "Everyday",
    condition: "Gently Used",
    originalPrice: 18000,
    price: 6100,
    fabric: "Cotton canvas",
    description: "Structured overshirt with patch pockets and horn buttons.",
    image: jacket,
    flaws: [{ label: "Cuff mark", note: "Faint ink mark on the right cuff, photographed up close." }],
  },
  {
    name: "Powder Blue Poplin Dress",
    brand: "Sapphire",
    category: "Dresses",
    size: "M",
    color: "Blue",
    occasion: "Everyday",
    condition: "New with Tags",
    originalPrice: 9800,
    price: 3600,
    fabric: "Cotton poplin",
    description: "Shirt dress with a self belt, never worn, tags attached.",
    image: dress,
  },
  {
    name: "Espresso Corduroy Trouser",
    brand: "Mango",
    category: "Bottoms",
    size: "S",
    color: "Brown",
    occasion: "Everyday",
    condition: "Gently Used",
    originalPrice: 7200,
    price: 2100,
    fabric: "Cotton corduroy",
    description: "Straight-leg cords with a gentle nap.",
    image: knit,
    flaws: [{ label: "Nap wear", note: "Slight flattening at the seat, visible in daylight." }],
  },
  {
    name: "Cream Cropped Cardigan",
    brand: "Zara",
    category: "Knitwear",
    size: "S",
    color: "Cream",
    occasion: "Everyday",
    condition: "Worn Once",
    originalPrice: 6400,
    price: 2300,
    fabric: "Cotton knit",
    description: "Cropped cardigan with pearl-effect buttons.",
    image: knit,
  },
  {
    name: "Ink Black Blazer",
    brand: "Nishat",
    category: "Outerwear",
    size: "M",
    color: "Black",
    occasion: "Formal",
    condition: "Gently Used",
    originalPrice: 16500,
    price: 5800,
    fabric: "Poly-wool suiting",
    description: "Single-breasted blazer, tailored shoulder, fully lined.",
    image: jacket,
    bestSeller: true,
  },
  {
    name: "Rust Chiffon Blouse",
    brand: "Khaadi",
    category: "Tops",
    size: "L",
    color: "Rust",
    occasion: "Festive",
    condition: "Photoshoot Sample",
    originalPrice: 8600,
    price: 3100,
    fabric: "Chiffon",
    description: "Tie-neck chiffon blouse sampled for a festive edit.",
    image: blouse,
    shoot: {
      campaign: "Paper Lanterns",
      season: "Winter 2025",
      blurb: "Styled over a slip for the closing frame of the shoot.",
    },
  },
  {
    name: "Sand Pleated Midi",
    brand: "Mango",
    category: "Bottoms",
    size: "M",
    color: "Sand",
    occasion: "Workwear",
    condition: "New with Tags",
    originalPrice: 9400,
    price: 3400,
    fabric: "Recycled polyester",
    description: "Knife-pleat midi skirt with an elasticated back.",
    image: knit,
  },
  {
    name: "Slate Wool Coat",
    brand: "COS",
    category: "Outerwear",
    size: "M",
    color: "Slate",
    occasion: "Formal",
    condition: "Gently Used",
    originalPrice: 34000,
    price: 11500,
    fabric: "Wool cashmere blend",
    description: "Longline coat with a concealed placket. Two winters of careful wear.",
    image: jacket,
    flaws: [{ label: "Lining", note: "Small repaired seam in the left pocket bag." }],
  },
  {
    name: "White Oversized Tee",
    brand: "Uniqlo",
    category: "Tops",
    size: "L",
    color: "White",
    occasion: "Everyday",
    condition: "Worn Once",
    originalPrice: 3200,
    price: 1200,
    fabric: "Heavyweight cotton",
    description: "Boxy tee with a dense hand-feel.",
    image: blouse,
  },
  {
    name: "Emerald Satin Gown",
    brand: "Élan",
    category: "Dresses",
    size: "S",
    color: "Emerald",
    occasion: "Party",
    condition: "Photoshoot Sample",
    originalPrice: 42000,
    price: 14800,
    fabric: "Silk satin",
    description: "Column gown with a cowl back, sampled once for editorial.",
    image: dress,
    shoot: {
      campaign: "After Hours",
      season: "Resort 2026",
      blurb: "Worn for four frames under studio light, then straight back to the rail.",
    },
  },
  {
    name: "Grey Marl Sweatshirt",
    brand: "Outfitters",
    category: "Knitwear",
    size: "L",
    color: "Grey",
    occasion: "Everyday",
    condition: "Gently Used",
    originalPrice: 4900,
    price: 1500,
    fabric: "Cotton fleece",
    description: "Soft-brushed sweatshirt with ribbed cuffs.",
    image: knit,
    flaws: [{ label: "Pilling", note: "Light pilling under both arms." }],
  },
  {
    name: "Navy Straight Jeans",
    brand: "Levi's",
    category: "Bottoms",
    size: "M",
    color: "Navy",
    occasion: "Everyday",
    condition: "Worn Once",
    originalPrice: 11000,
    price: 3900,
    fabric: "Cotton denim",
    description: "Mid-rise straight jeans with a raw hem.",
    image: knit,
  },
  {
    name: "Blush Organza Shirt",
    brand: "Sapphire",
    category: "Tops",
    size: "S",
    color: "Blush",
    occasion: "Party",
    condition: "New with Tags",
    originalPrice: 8800,
    price: 3300,
    fabric: "Organza",
    description: "Sheer organza shirt with covered buttons, unworn.",
    image: blouse,
  },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const impact: Record<string, { water: number; carbon: number }> = {
  Tops: { water: 2700, carbon: 6 },
  Bottoms: { water: 3800, carbon: 9 },
  Dresses: { water: 4200, carbon: 11 },
  Outerwear: { water: 5100, carbon: 15 },
  Knitwear: { water: 3100, carbon: 8 },
};

export const products: Product[] = seeds.map((s, i) => {
  const eco = impact[s.category] ?? { water: 3000, carbon: 7 };
  return {
    id: `tt-${String(i + 1).padStart(3, "0")}`,
    slug: slugify(s.name),
    name: s.name,
    brand: s.brand,
    category: s.category,
    size: s.size,
    color: s.color,
    occasion: s.occasion,
    condition: s.condition,
    originalPrice: s.originalPrice,
    price: s.price,
    fabric: s.fabric,
    measurements: "Chest 52cm · Length 68cm · Shoulder 44cm (laid flat)",
    description: s.description,
    image: s.image,
    imageAlt: `${s.name} by ${s.brand} — ${s.color} ${s.category.toLowerCase()}, condition ${s.condition}`,
    flaws: s.flaws ?? [],
    shoot: s.shoot ?? null,
    status: "published",
    addedAt: new Date(Date.UTC(2026, 6, 28 - i)).toISOString(),
    bestSeller: s.bestSeller ?? false,
    waterSavedL: eco.water,
    carbonSavedKg: eco.carbon,
  };
});

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getById = (id: string) => products.find((p) => p.id === id);

export const categories = [...new Set(products.map((p) => p.category))];
export const brands = [...new Set(products.map((p) => p.brand))].sort();
export const sizes = ["XS", "S", "M", "L", "XL"];
export const conditions: Product["condition"][] = [
  "New with Tags",
  "Photoshoot Sample",
  "Worn Once",
  "Gently Used",
];
export const occasions: Product["occasion"][] = [
  "Everyday",
  "Formal",
  "Festive",
  "Workwear",
  "Party",
];
export const colors = [...new Set(products.map((p) => p.color))].sort();

export const formatPKR = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;
