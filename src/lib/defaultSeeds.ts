export interface SeedCategory {
  name: string;
  icon: string;
  order_index: number;
  websites: {
    title: string;
    url: string;
    description: string;
    icon_url: string;
    order_index: number;
  }[];
}

export const DEFAULT_SEED_DATA: SeedCategory[] = [];
