export type CatalogCategory =
  | "pasta_base"
  | "sauce"
  | "special"
  | "topping"
  | "soup"
  | "starter"
  | "drink";

export type CatalogItem = {
  id: string;
  category: CatalogCategory;
  name_de: string;
  name_tr: string;
  price: number;
  vegan: boolean;
  image: string;
  sort_order: number;
  is_active: boolean;
};

export type CatalogItemRow = Omit<CatalogItem, "is_active"> & { is_active?: boolean };
