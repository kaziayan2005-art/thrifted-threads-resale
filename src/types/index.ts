export type ConditionGrade =
  | "New with Tags"
  | "Photoshoot Sample"
  | "Worn Once"
  | "Gently Used";

export type ListingStatus = "draft" | "published" | "sold" | "delisted";

export type Occasion = "Everyday" | "Formal" | "Festive" | "Workwear" | "Party";

export interface Flaw {
  label: string;
  note: string;
}

export interface ShootStory {
  campaign: string;
  season: string;
  blurb: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  occasion: Occasion;
  condition: ConditionGrade;
  originalPrice: number;
  price: number;
  fabric: string;
  measurements: string;
  description: string;
  image: string;
  imageAlt: string;
  flaws: Flaw[];
  shoot: ShootStory | null;
  status: ListingStatus;
  addedAt: string;
  bestSeller: boolean;
  waterSavedL: number;
  carbonSavedKg: number;
}

export interface CartLine {
  productId: string;
  addedAt: number;
}
