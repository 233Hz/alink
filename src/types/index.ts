export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  website_count?: number;
}

export interface Website {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  url: string;
  description: string;
  icon_url: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type CategoryFormData = {
  name: string;
  icon: string;
  order_index: number;
};

export type WebsiteFormData = {
  title: string;
  url: string;
  description: string;
  icon_url: string;
  category_id: string | null;
  order_index: number;
};
