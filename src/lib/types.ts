// Типы ответов публичного API (src/api/public_router.py в бэкенде).

export interface Group {
  group_slug: string;
  base_name: string;
  variants_count: number;
  services_count: number;
  cheapest_price_kopecks: number;
}

export interface CategoryVariant {
  category_id: number;
  category_name: string;
  services_count: number;
  cheapest_price_kopecks: number;
}

export interface Service {
  ns_service_id: number;
  category_id: number | null;
  category_name: string | null;
  service_name: string;
  base_name: string | null;
  group_slug: string | null;
  rub_price_kopecks: number;
  in_stock: number;
}

export interface ServiceCard extends Service {
  similar: Service[];
}

export interface ServicesPage {
  items: Service[];
  total: number;
  page: number;
  page_size: number;
}

export interface SearchResult {
  query: string;
  items: Service[];
}

export interface Stats {
  products_in_stock: number;
  groups_count: number;
  categories_count: number;
  updated_at: string | null;
}

export interface SitemapData {
  groups: string[];
  services: { ns_service_id: number; updated_at: string | null }[];
}
