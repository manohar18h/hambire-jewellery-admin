export interface Category {
  categoryId?: number;
  metal: string;
  categoryName: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  mobileBannerImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  sortOrder?: number;
  activeStatus?: boolean;
  featured?: boolean;
}

export interface SubCategory {
  subCategoryId?: number;
  categoryId?: number;
  category?: {
    categoryId?: number;
    categoryName?: string;
  };
  subCategoryName: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  mobileBannerImageUrl?: string;
  iconImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  sortOrder?: number;
  activeStatus?: boolean;
  featured?: boolean;
}
export interface ProductImage {
  imageId?: number;
  imageUrl: string;
  s3Key?: string;
  altText?: string;
  imageType?: string;
  primaryImage?: boolean;
  sortOrder?: number;
}
export interface Product {
  productId?: number;
  subCategory?: {
    subCategoryId?: number;
    subCategoryName?: string;
    category?: {
      categoryId?: number;
      categoryName?: string;
    };
  };
  subCategoryId?: number;
  itemName: string;
  slug: string;
  sku: string;
  productCode?: string;
  catalogue?: string;
  design?: string;
  size?: string;
  metal?: string;
  purity?: string;
  gender?: string;
  occasion?: string;
  styleType?: string;
  collectionName?: string;
  shortDescription?: string;
  longDescription?: string;
  careInstructions?: string;
  returnPolicy?: string;
  certificationDetails?: string;
  metalWeight?: number;
  grossWeight?: number;
  netWeight?: number;
  wastage?: number;
  makingCharges?: number;
  stoneWeight?: number;
  stoneRate?: number;
  stoneAmount?: number;
  waxWeight?: number;
  waxRate?: number;
  waxAmount?: number;
  diamondWeight?: number;
  diamondRate?: number;
  diamondAmount?: number;
  bitsWeight?: number;
  bitsRate?: number;
  bitsAmount?: number;
  enamelWeight?: number;
  enamelRate?: number;
  enamelAmount?: number;
  pearlsWeight?: number;
  pearlsRate?: number;
  pearlsAmount?: number;
  otherWeight?: number;
  otherRate?: number;
  otherAmount?: number;
  basePrice?: number;
  salePrice?: number;
  discountPercent?: number;
  totalAmount?: number;
  stockCount?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  activeStatus?: boolean;
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  customizable?: boolean;
  availabilityStatus?: string;
  thumbnailImageUrl?: string;
  hoverImageUrl?: string;
  videoUrl?: string;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string[];
  searchKeywords?: string[];
  linkedStockProductId?: number;
  stockBoxName?: string;
  linkedWeight?: number;
  primaryDisplayProduct?: boolean;
}

export interface StockWeightOption {
  stockProductId: number;
  weight: number;
  size?: string;
  qty: number;
}
