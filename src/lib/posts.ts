export interface Post {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  body: string[];
}

export const posts: Post[] = [
  {
    slug: "how-to-read-a-condition-grade",
    title: "How to read a condition grade",
    category: "Buying well",
    date: "28 July 2026",
    excerpt: "Four words that decide whether a piece is worth your money — and what each one hides.",
    body: [
      "Condition language in resale is usually vague on purpose. 'Excellent' and 'like new' mean whatever the seller needs them to mean that day.",
      "We use four fixed grades and photograph every disclosed flaw, so the grade is a claim you can check rather than a mood.",
      "The most misunderstood tier is Photoshoot Sample. These pieces have been worn — on set, under lights, pinned at the back — but almost never washed. Structure is usually better than a Worn Once piece.",
    ],
  },
  {
    slug: "five-ways-to-wear-a-slip-dress",
    title: "Five ways to wear one slip dress",
    category: "Get the look",
    date: "14 July 2026",
    excerpt: "The single most re-wearable piece on the rail, styled from desk to dinner.",
    body: [
      "A bias-cut slip is the closest thing resale has to a blank canvas: it layers over a tee, under a knit, and inside a blazer without complaint.",
      "Start with the least effortful version — slip, flat sandal, no jewellery. Everything else is an addition to that base.",
      "For workwear, put a fine-gauge crew neck over the top and let the skirt do the work. It reads as a skirt, not a dress.",
    ],
  },
  {
    slug: "the-water-cost-of-a-new-shirt",
    title: "The water cost of one new shirt",
    category: "Sustainability",
    date: "2 July 2026",
    excerpt: "2,700 litres, and where that number actually comes from.",
    body: [
      "The figure gets quoted constantly and almost never sourced. It comes from cotton cultivation, wet processing and dyeing across the full supply chain.",
      "Second-hand purchase doesn't reduce that water — it avoids a new instance of it. That's the honest framing, and it's still worth doing.",
      "We tally the avoided figure per order rather than per year, because an annual number is easy to feel nothing about.",
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
