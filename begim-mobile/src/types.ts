export type Screen =
  | "splash"
  | "home"
  | "catalog"
  | "product"
  | "community"
  | "recipe"
  | "cart"
  | "profile";

export interface CartItem {
  id: string;
  quantity: number;
}
