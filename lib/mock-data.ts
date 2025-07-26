import type { Product, Category, Store } from "./types"
import products from "@/lib/products.json"
import { slugify } from "./utils";




const categoryAssets: Record<string, { icon?: string; photo?: string }> = {
  "electronics": {
    icon: "/images/categories/electronics-icon.png",
    photo: "/images/categories/electronics.jpg"
  },
  "fashion": {
    icon: "/images/categories/fashion-icon.png",
    photo: "/images/categories/fashion.jpg"
  },
  // ...add more as needed
};



// Function to build category summary array
export function buildCategorySummary(products: Product[]) {
  const categoryMap: Record<string, Set<string>> = {};
  const categoryCount: Record<string, number> = {};

  products.forEach(product => {
    if (product.categories && product.categories.length > 0) {
      const [root, ...rest] = product.categories;
      const rootKey = root.toLowerCase();
      if (!categoryMap[rootKey]) {
        categoryMap[rootKey] = new Set();
        categoryCount[rootKey] = 0;
      }
      rest.forEach(cat => categoryMap[rootKey].add(cat));
      categoryCount[rootKey] += 1;
    }
  });

  return Object.entries(categoryMap).map(([root, set]) => ({
    name: root,
    [root]: Array.from(set),
    slug: slugify(root),
    itemsCount: categoryCount[root],
    ...(categoryAssets[root] || {})
  }));
}
// Mock data for preview/development
export const mockCategories = buildCategorySummary(products as Product[])


export const mockStores: Store[] = [
  { 
    id: "1",
    owner_id: "user-1",
    name: "TechHub Store",
    slug: "techhub-store",
    description: "Your one-stop shop for electronics",
    logo_url: "/placeholder.svg?height=100&width=100",
    banner_url: "/placeholder.svg?height=300&width=800",
    address: "123 Tech Street, Silicon Valley",
    phone: "+1-555-0123",
    email: "contact@techhub.com",
    is_verified: true,
    is_active: true,
    rating: 4.8,
    total_sales: 1250,
    status: "pending",
    country: "germany",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    owner_id: "user-2",
    name: "Fashion Forward",
    slug: "fashion-forward",
    description: "Latest trends in fashion",
    logo_url: "/placeholder.svg?height=100&width=100",
    banner_url: "/placeholder.svg?height=300&width=800",
    address: "456 Fashion Ave, New York",
    phone: "+1-555-0456",
    email: "hello@fashionforward.com",
    is_verified: true,
    is_active: true,
    rating: 4.6,
    status: "active",
    country: "UK",
    total_sales: 890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockProducts: Product[] = products as unknown as Product[]

// Mock API functions for development
export const mockApi = {
  getProducts: async (filters?: any): Promise<Product[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let products = [...mockProducts]

    if (filters?.category) {
      products = products.filter((p) => p.categories?.includes(filters.category))
    }

    if (filters?.featured) {
      products = products.filter((p) => p.badge === "Amazon's Choice" || p.amazon_choice)
    }

    if (filters?.flash_sale) {
      products = products.filter((p) => p.sponsered)
    }

    return products
  },

  getProduct: async (id: string): Promise<Product | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockProducts.find((p) => p.asin === id) || null
  },

  getCategories: async (): Promise<Category[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockCategories
  },

  getStores: async (): Promise<Store[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockStores
  },
}

export const descriptionTemplates: Record<string, string[]> = {
  luxury: [
    "Discover the finest in luxury with our exclusive collection of premium products and world-class service.",
    "Experience elegance and sophistication—your destination for luxury shopping.",
    "Indulge in opulence with curated luxury brands and personalized service.",
    "Elevate your lifestyle with our handpicked selection of luxury goods.",
  ],
  "cell phone": [
    "Stay connected with the latest smartphones and accessories, curated for tech enthusiasts.",
    "Your one-stop shop for cutting-edge mobile devices and unbeatable deals.",
    "Explore top brands and the newest releases in mobile technology.",
    "Upgrade your communication with our premium cell phone selection.",
  ],
  digital: [
    "Explore a wide range of digital gadgets and electronics for every lifestyle.",
    "Upgrade your digital life with our top-rated products and expert support.",
    "Find the latest in digital innovation and smart devices.",
    "Empowering your digital world with quality and value.",
  ],
  "electrical appliances": [
    "Make life easier with our reliable and energy-efficient electrical appliances.",
    "Transform your home with the latest in electrical convenience and style.",
    "Discover appliances that blend performance with modern design.",
    "Your trusted source for home and kitchen electrical essentials.",
  ],
  "women's clothing": [
    "Step out in style with our fashionable and comfortable women's clothing.",
    "Find your perfect look with our diverse collection for every occasion.",
    "Empowering women through fashion and quality apparel.",
    "Trendy, timeless, and tailored for you—shop our women's collection.",
  ],
  "men's clothing": [
    "Upgrade your wardrobe with our stylish and versatile men's clothing.",
    "From casual to formal, discover quality menswear for every lifestyle.",
    "Classic and contemporary styles for the modern man.",
    "Dress to impress with our curated men's fashion picks.",
  ],
  accessories: [
    "Complete your look with our unique and trendy accessories.",
    "Find the perfect finishing touch for any outfit in our accessories shop.",
    "Accessorize with confidence—shop our latest arrivals.",
    "Elevate your style with our handpicked accessories collection.",
  ],
  "mother and baby": [
    "Caring for moms and babies with safe, quality products you can trust.",
    "Everything you need for motherhood and baby care, all in one place.",
    "Nurture and comfort for every stage of motherhood.",
    "Your partner in parenting—shop our mother and baby essentials.",
  ],
  luggage: [
    "Travel in style with our durable and fashionable luggage options.",
    "Pack smart and travel easy with our premium luggage collection.",
    "Adventure-ready luggage for every journey.",
    "Your trusted companion for business and leisure travel.",
  ],
  makeups: [
    "Unleash your beauty with our top-quality makeup products.",
    "Enhance your natural glow with our curated makeup selection.",
    "Beauty essentials for every skin tone and style.",
    "Express yourself with our vibrant and lasting makeups.",
  ],
  shoes: [
    "Step up your shoe game with our stylish and comfortable footwear.",
    "Find the perfect pair for every occasion in our shoe collection.",
    "Walk with confidence—shop our latest shoe arrivals.",
    "Quality, comfort, and style—discover your next favorite shoes.",
  ],
  medical: [
    "Your health is our priority—shop trusted medical supplies and equipment.",
    "Quality medical products for your well-being and peace of mind.",
    "Stay prepared with our comprehensive medical essentials.",
    "Caring for you and your family with reliable medical solutions.",
  ],
  "car products": [
    "Drive with confidence using our top-rated car products and accessories.",
    "Everything you need for car care, maintenance, and upgrades.",
    "Enhance your driving experience with our automotive essentials.",
    "Your one-stop shop for car lovers and enthusiasts.",
  ],
  "musical instrument": [
    "Find your sound with our wide range of musical instruments.",
    "Inspiring musicians with quality instruments and accessories.",
    "Play, create, and perform with our trusted musical gear.",
    "Your music journey starts here—shop our instrument collection.",
  ],
  "home improvement": [
    "Transform your space with our home improvement solutions.",
    "DIY made easy—shop tools, materials, and inspiration.",
    "Upgrade your home with our quality improvement products.",
    "From renovation to repair, we have your home covered.",
  ],
  all: [
    "Welcome to your trusted store for quality products and exceptional service.",
    "Shop with confidence—our store offers something for everyone.",
    "Discover great deals and a wide selection for every need.",
    "Your satisfaction is our mission—enjoy shopping with us!",
  ],
}
export const storeTypes = [
    "Luxury",
    "Cell phone",
    "Digital",
    "Electrical appliances",
    "Women's clothing",
    "Men's clothing",
    "Accessories",
    "Mother and baby",
    "Luggage",
    "Makeups",
    "Shoes",
    "Medical",
    "Car Products",
    "Musical instrument",
    "Home improvement",
    "All"
]

