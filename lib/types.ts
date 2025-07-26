// Amazon product types
export interface AmazonProductVariation {
  asin: string;
  color?: string;
  currency?: string;
  image?: string;
  name?: string;
  price?: number;
  size?: string | null;
  unit_price?: number | null;
}

export interface AmazonProductBuyboxPrices {
  discount?: string;
  final_price?: number;
  initial_price?: number;
  unit_price?: number | null;
}

export interface AmazonProductSubcategoryRank {
  subcategory_name: string;
  subcategory_rank: number;
}

export interface AmazonProductDetail {
  type: string;
  value: string | null;
}

export interface AmazonProductCustomersSay {
  keywords: {
    mixed?: string[];
    negative?: string[] | null;
    positive?: string[];
  };
  text?: string;
}

export interface Product {
  id?: string;
  title: string;
  seller_name?: string;
  brand?: string;
  description?: string;
  initial_price?: number;
  final_price?: number;
  currency?: string;
  availability?: string;
  reviews_count?: number;
  categories?: string[];
  asin?: string;
  buybox_seller?: string;
  number_of_sellers?: number;
  root_bs_rank?: number;
  answered_questions?: number;
  domain?: string;
  images_count?: number;
  url?: string;
  video_count?: number;
  image_url?: string;
  item_weight?: string;
  rating?: number;
  product_dimensions?: string;
  seller_id?: string;
  date_first_available?: string;
  discount?: string;
  model_number?: string;
  manufacturer?: string;
  department?: string;
  plus_content?: boolean;
  upc?: string | null;
  video?: boolean;
  top_review?: string;
  variations?: AmazonProductVariation[];
  delivery?: string[];
  features?: string[];
  format?: string | null;
  buybox_prices?: AmazonProductBuyboxPrices;
  parent_asin?: string;
  input_asin?: string | null;
  ingredients?: string | null;
  origin_url?: string | null;
  bought_past_month?: number;
  is_available?: boolean;
  root_bs_category?: string;
  bs_category?: string;
  bs_rank?: number;
  badge?: string;
  subcategory_rank?: AmazonProductSubcategoryRank[];
  amazon_choice?: boolean;
  images?: string[];
  product_details?: AmazonProductDetail[];
  prices_breakdown?: {
    deal_type?: string | null;
    list_price?: number | null;
    typical_price?: number | null;
  };
  country_of_origin?: string;
  from_the_brand?: string[];
  product_description?: { type: string; url: string }[];
  seller_url?: string;
  sustainability_features?: string | null;
  climate_pledge_friendly?: boolean;
  videos?: string[];
  other_sellers_prices?: any;
  downloadable_videos?: string[];
  editorial_reviews?: string | null;
  about_the_author?: string | null;
  zipcode?: string | null;
  sponsered?: boolean;
  store_url?: string;
  ships_from?: string;
  customers_say?: AmazonProductCustomersSay;
  max_quantity_available?: number | null;
  variations_values?: any;
  return_policy?: string | null;
  inactive_buy_box?: any;
}

export interface Profile {
  id: string // UUID (same as Supabase auth.uid)
  email: string
  full_name?: string
  username?: string // Optional display username
  avatar_url?: string
  phone?: string
  role: "customer" | "merchant" | "admin" | "manager"
  wallet_balance: number // Can be used for purchases or withdrawals
  status: "active" | "suspended" | "pending" | "blocked" // For admin approval process
  is_verified: boolean // KYC or email verification
  withdrawal_pin?: string // Optional PIN for withdrawals
  address?: string // Optional full address
  city?: string
  state?: string
  country?: string
  postal_code?: string
  preferred_currency?: string // e.g., "USD", "KHR"
  language?: string // UI language preference
  date_of_birth?: string // For KYC or age validation
  gender?: "male" | "female" | "other"
  referred_by?: string // Referral code if any
  created_at: string
  updated_at?: string
}


export interface Category {
  name: string
  [key: string]: string[] | number | string | undefined
  itemsCount: number
  icon?: string
  photo?: string
}

export interface Review {
  id: string
  user_id: string
  store_id: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Follower {
  id: string
  follower_id: string
  store_id: string
  created_at: string
}

export type StoreStatus = "active" | "suspended" | "pending" | "blocked"
  

export interface Store {
  id: string
  owner_id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  banner_url?: string
  address?: string
  phone?: string
  followers?: Follower[]
  isFollowing?: boolean
  reviews?: Review[]
  products?: Product[]
  owner?:Profile
  country: string
  category?: string
  status: StoreStatus // For admin approval process
  city?: string
  state?: string
  store_level?: number
  website_url?: string
  postal_code?: string
  email?: string
  is_verified: boolean
  is_active: boolean
  rating: number
  total_sales: number
  total_revenue?: number
  created_at: string
  updated_at: string
  id_photo_front_url?: string
  id_photo_back_url?: string
}

export interface OrderItems{
  id?: string
  order_id?: string,
  product_id: string,
  asin?: string,
  quantity: number,
  price: number
  total : number
  product: Product
  created_at: string
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
export type PaymentStatus = "pending" | "confirmed" | "failed" | "cancelled"

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: OrderStatus
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  currency: string
  order_items: OrderItems[]
  payment_method?: string
  payment_status: PaymentStatus
  customer?: Profile
  shipping_address?: {
    email: string
    name: string
    phone: string
    address: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  billing_address?: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  notes?: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  asin?: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
} 
export type WalletTypes = "crypto_usdt_erc20"| "crypto_usdt_trc20" | "bank_account"
export interface Wallet {
  id: string;
  name: string;
  type: WalletTypes
  address: string;
  currency: string;
  is_default: boolean;
  created_at: string;
  // Bank fields (optional)
  account_holder?: string;
  account_number?: string;
  bank_name?: string;
  routing_number?: string;
  routing_number_type?: 'routing_number'| 'swift'| 'bic' | 'iban'
  bank_address?: string;
  country?: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: string; // 'shipping' or 'billing'
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}


export type OrderItemWithDetails = Order & {
  // Expanded Product
  customer: Profile | null
  // Expanded Order
  order_items:Order["order_items"] | null
}

export type StoreNewsItem = {
  id: string
  title: string
  content: string
  image_urls: string[]
  created_at: string
  is_published: boolean
  author?: {
      id: string
      name: string
      avatar_url?: string
  }
}

export interface Recharge {
  id: string
  user_id: string
  amount: number
  currency: string
  method: string
  fee: number
  status: "pending" | "success" | "failed" | "cancelled"
  reference_id?: string
  prove_url?: string
  description?: string
  user?: Profile
  transaction_hash?: string | null
  metadata?: Record<string, any>
  created_at: string
  updated_at?: string
}

export interface Withdrawal {
    id: string
    user_id: string
    amount: number
    currency: string
    method: string
    status: "pending" | "success" | "failed" | "cancelled"
    // date: string
    processed_date?: string | null
    wallet_address?: string | null
    transactionHash?: string | null
    bank_name?: string | null
    account_number?: string | null
    fee: number
    user?: Profile
    net_amount: number
    failure_reason?: string | null
    created_at: string
    updated_at: string
}

export interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'spam';
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
}