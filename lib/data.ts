// ─── Product Data ─────────────────────────────────────────────────────────────

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  colors: string[];
  tags: string[];
  description: string;
  image: string;
  isNew?: boolean;
  isBestSeller?: boolean;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Vaishnavi Collections Arc Lamp",
    category: "Lighting",
    price: 249,
    originalPrice: 349,
    rating: 4.9,
    reviewCount: 312,
    badge: "Best Seller",
    colors: ["#1a1a18", "#f5f4f0", "#f97316"],
    tags: ["lighting", "arc", "modern"],
    description: "Sculptural arc floor lamp with warm-toned LED and dimmer. Solid marble base, powder-coated steel arm.",
    image: "/products/arc-lamp.webp",
    isBestSeller: true,
  },
  {
    id: 2,
    name: "Prism Pendant",
    category: "Lighting",
    price: 189,
    rating: 4.7,
    reviewCount: 198,
    badge: "New",
    colors: ["#c9b99a", "#1a1a18"],
    tags: ["lighting", "pendant", "glass"],
    description: "Hand-blown borosilicate glass pendant with brass fitting. Casts stunning prismatic light patterns.",
    image: "/products/arc-lamp-2.webp",
    isNew: true,
  },
  {
    id: 3,
    name: "Sedona Side Table",
    category: "Furniture",
    price: 399,
    originalPrice: 499,
    rating: 4.8,
    reviewCount: 256,
    badge: "Sale",
    colors: ["#c9b99a", "#8b7355"],
    tags: ["furniture", "table", "walnut"],
    description: "Solid walnut side table with hairpin legs. Each piece features unique natural grain patterns.",
    image: "/products/side-table.webp",
    isBestSeller: true,
  },
  {
    id: 4,
    name: "Cloud Shelf System",
    category: "Storage",
    price: 299,
    rating: 4.6,
    reviewCount: 143,
    badge: "New",
    colors: ["#f5f4f0", "#1a1a18"],
    tags: ["storage", "shelf", "modular"],
    description: "Modular floating shelf system. Mix and match sizes to create your perfect wall composition.",
    image: "/products/cloud-shelf.webp",
    isNew: true,
  },
  {
    id: 5,
    name: "Ritual Ceramic Vase",
    category: "Decor",
    price: 89,
    rating: 4.9,
    reviewCount: 421,
    badge: "Best Seller",
    colors: ["#c9b99a", "#f5f4f0", "#6b6b65"],
    tags: ["decor", "ceramic", "handmade"],
    description: "Hand-thrown stoneware vase with matte glaze. Each piece is uniquely imperfect by design.",
    image: "/products/ceramic-vase.webp",
    isBestSeller: true,
  },
  {
    id: 6,
    name: "Monolith Bookend Set",
    category: "Decor",
    price: 79,
    originalPrice: 99,
    rating: 4.5,
    reviewCount: 88,
    badge: "Sale",
    colors: ["#1a1a18", "#6b6b65"],
    tags: ["decor", "bookend", "marble"],
    description: "Solid marble bookend set with matte black steel dividers. Substantial and silent.",
    image: "/products/book-shelf.webp",
  },
  {
    id: 7,
    name: "Dusk Throw Blanket",
    category: "Textiles",
    price: 139,
    rating: 4.8,
    reviewCount: 567,
    colors: ["#d4c4a8", "#8b7355", "#6b6b65"],
    tags: ["textiles", "blanket", "wool"],
    description: "100% Mongolian cashmere throw blanket. Exceptionally soft, generously sized, ethically sourced.",
    image: "/products/bed-blanket.webp",
    isBestSeller: true,
  },
  {
    id: 8,
    name: "Form Mirror",
    category: "Decor",
    price: 459,
    rating: 4.7,
    reviewCount: 174,
    badge: "New",
    colors: ["#c9b99a", "#1a1a18"],
    tags: ["decor", "mirror", "arch"],
    description: "Arched standing mirror in solid ash wood frame. Full-length with anti-tip wall anchor.",
    image: "/products/mirror.webp",
    isNew: true,
  },
  {
    id: 9,
    name: "Lumen Desk Lamp",
    category: "Lighting",
    price: 169,
    originalPrice: 219,
    rating: 4.6,
    reviewCount: 203,
    badge: "Sale",
    colors: ["#1a1a18", "#f5f4f0", "#c9b99a"],
    tags: ["lighting", "desk", "adjustable"],
    description: "Architect-style desk lamp with 5-axis articulation. USB-C charging port integrated into base.",
    image: "/products/desk-lamp.webp",
  },
  {
    id: 10,
    name: "Terra Planter",
    category: "Decor",
    price: 69,
    rating: 4.8,
    reviewCount: 392,
    badge: "Best Seller",
    colors: ["#c9b99a", "#8b7355", "#f5f4f0"],
    tags: ["decor", "planter", "ceramic"],
    description: "Terracotta planter with drainage hole and matching saucer. Earthy tones, modern silhouette.",
    image: "/products/planter.webp",
    isBestSeller: true,
  },
  {
    id: 11,
    name: "Noma Dining Chair",
    category: "Furniture",
    price: 329,
    rating: 4.7,
    reviewCount: 231,
    badge: "New",
    colors: ["#c9b99a", "#1a1a18", "#f5f4f0"],
    tags: ["furniture", "chair", "dining"],
    description: "Solid oak dining chair with Danish cord weave seat. Stackable, heirloom quality.",
    image: "/products/dinning-chair.webp",
    isNew: true,
  },
  {
    id: 12,
    name: "Koto Storage Basket",
    category: "Storage",
    price: 59,
    originalPrice: 79,
    rating: 4.5,
    reviewCount: 145,
    badge: "Sale",
    colors: ["#c9b99a", "#f5f4f0"],
    tags: ["storage", "basket", "seagrass"],
    description: "Hand-woven seagrass storage basket with removable cotton liner. Set of two.",
    image: "/products/busket.webp",
  },
];

// ─── Categories ──────────────────────────────────────────────────────────────

export type Category = {
  id: number;
  name: string;
  count: number;
  description: string;
  color: string;
  image: string;
};

export const categories: Category[] = [
  { id: 1, name: "Lighting", count: 24, description: "Sculptural illumination", color: "#f97316", image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=600&auto=format&fit=crop" },
  { id: 2, name: "Furniture", count: 38, description: "Timeless craftsmanship", color: "#8b7355", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop" },
  { id: 3, name: "Decor", count: 56, description: "Curated objects", color: "#6b6b65", image: "/featured-cat/decor.jpg" },
  { id: 4, name: "Textiles", count: 19, description: "Tactile luxury", color: "#c9b99a", image: "/featured-cat/textiles.jpg" },
  { id: 5, name: "Storage", count: 15, description: "Functional beauty", color: "#1a1a18", image: "/featured-cat/storage.jpg" },
];

// ─── Banner / Slider ─────────────────────────────────────────────────────────

export type Slide = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaLink: string;
  badge: string;
  bg: string;
  image: string;
};

export const slides: Slide[] = [
  {
    id: 1,
    title: "Light as a\nStatement",
    subtitle: "New Lighting Collection",
    description: "Sculptural floor lamps and pendants that transform any room into a gallery.",
    cta: "Shop Lighting",
    ctaLink: "/products?category=Lighting",
    badge: "New Arrivals '26",
    bg: "linear-gradient(135deg, #fef3e2 0%, #fde8c8 50%, #fbd5a0 100%)",
    image: "/banner-image/banner-lamp.jpg",
  },
  {
    id: 2,
    title: "Crafted To\nLast Long",
    subtitle: "Furniture Collection",
    description: "Solid wood furniture made by skilled artisans. Designed to outlast trends.",
    cta: "Explore Furniture",
    ctaLink: "/products?category=Furniture",
    badge: "Artisan Made",
    bg: "linear-gradient(135deg, #f0ede8 0%, #e8e2d8 50%, #ddd4c5 100%)",
    image: "/banner-image/banner-chair.jpg",
  },
  {
    id: 3,
    title: "Up to 40%\nOff Decor",
    subtitle: "Season's End Sale",
    description: "Premium ceramics, mirrors, and objects at our biggest discount of the year.",
    cta: "Shop the Sale",
    ctaLink: "/products?badge=Sale",
    badge: "Limited Time",
    bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
    image: "/banner-image/banner-decor.jpg",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

export type Testimonial = {
  id: number;
  name: string;
  role: string;
  location: string;
  text: string;
  rating: number;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Amara Okon",
    role: "Interior Designer",
    location: "New York, USA",
    text: "Vaishnavi Collections consistently offers the most beautifully designed objects I've found online. The Arc Lamp is now a staple in every project I take on. Shipping was faster than expected.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Sebastian Müller",
    role: "Architect",
    location: "Berlin, Germany",
    text: "The quality speaks for itself — you can feel the material thoughtfulness in every piece. The Sedona Side Table exceeded my expectations. Highly recommend to anyone serious about their space.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Yuki Tanaka",
    role: "Photographer",
    location: "Tokyo, Japan",
    text: "I was skeptical buying furniture online but the Noma Chair arrived impeccably packaged. The Danish cord weave is tighter and more refined than pieces I've purchased in-store for twice the price.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Fatima Hassan",
    role: "Stylist",
    location: "Dubai, UAE",
    text: "The Ritual Ceramic Vase is stunning in person — the photography on the site does not even do it justice. Customer service was incredibly responsive when I had a question about sizing.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Liam Callahan",
    role: "Product Designer",
    location: "London, UK",
    text: "Every piece I've ordered has been a perfect addition to my home. The attention to detail from packaging to product is remarkable. Vaishnavi Collections has become my default for home goods.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
];

// ─── Logo Cloud (Brand partners) ─────────────────────────────────────────────
export const brands = [
  { name: "Wallpaper*", logo: "/brands/wallpaper.svg" },
  { name: "Dezeen", logo: "/brands/dezeen.svg" },
  { name: "Monocle", logo: "/brands/monocle.svg" },
  { name: "Kinfolk", logo: "/brands/kinfolk.svg" },
  { name: "Architectural Digest", logo: "/brands/ad.svg" },
  { name: "Dwell", logo: "/brands/dwell.svg" },
];

// ─── Offers / Bento Grid ──────────────────────────────────────────────────────

export type Offer = {
  id: number;
  title: string;
  description: string;
  badge: string;
  discount?: string;
  cta: string;
  size: "large" | "medium" | "small" | "tall";
  bg: string;
  accent: string;
  image: string;
};

export const offers: Offer[] = [
  {
    id: 1,
    title: "Free Express Shipping",
    description: "On all orders over $500. Handled with architectural care and premium packaging.",
    badge: "Limited Time",
    cta: "Learn More",
    size: "large",
    bg: "linear-gradient(135deg, #111110 0%, #1f1f1e 100%)",
    accent: "#f97316",
    image: "/offers/furniture.webp",
  },
  {
    id: 2,
    title: "Summer Lighting Edit",
    description: "30% off all pendant and arc lamps this month only.",
    badge: "30% Off",
    discount: "30%",
    cta: "Shop Lighting",
    size: "medium",
    bg: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    accent: "#c2410c",
    image: "/offers/lamp.webp",
  },
  {
    id: 3,
    title: "Members Get More",
    description: "Join Vaishnavi Collections+ for early access, exclusive prices, and free styling consultation.",
    badge: "Exclusive",
    cta: "Join Free",
    size: "tall",
    bg: "linear-gradient(135deg, #fafaf9 0%, #f0ede8 100%)",
    accent: "#111110",
    image: "/offers/decor.jpg",
  },
  {
    id: 4,
    title: "Refer & Earn",
    description: "Give $25, get $25 when your friend places their first order.",
    badge: "$25 Credit",
    cta: "Refer a Friend",
    size: "medium",
    bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    accent: "#166534",
    image: "/offers/refer.webp",
  },
  {
    id: 5,
    title: "Interior Styling",
    description: "Free 45-minute virtual session with our in-house design team.",
    badge: "Free Service",
    cta: "Book Session",
    size: "small",
    bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    accent: "#1e40af",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

export const stats = [
  { value: 50, suffix: "K+", label: "Happy Customers" },
  { value: 200, suffix: "+", label: "Curated Products" },
  { value: 4.9, suffix: "★", label: "Average Rating" },
  { value: 30, suffix: "-Day", label: "Free Returns" },
];

// ─── Team ─────────────────────────────────────────────────────────────────────

export const team = [
  { 
    name: "Clara Voss", 
    role: "Creative Director", 
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" 
  },
  { 
    name: "James Reid", 
    role: "Head of Product", 
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop" 
  },
  { 
    name: "Mia Nakamura", 
    role: "Lead Designer", 
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop" 
  },
  { 
    name: "Omar Farouk", 
    role: "Operations Director", 
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop" 
  },
];

// ─── Filter Options ───────────────────────────────────────────────────────────

export const filterColors = [
  { name: "Charcoal", hex: "#1a1a18" },
  { name: "Cream", hex: "#f5f4f0" },
  { name: "Walnut", hex: "#8b7355" },
  { name: "Sand", hex: "#c9b99a" },
  { name: "Orange", hex: "#f97316" },
  { name: "Stone", hex: "#6b6b65" },
];
