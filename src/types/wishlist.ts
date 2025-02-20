export interface WishlistItem {
  variant_id: string;
  quantity?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface DeleteWishlistItem extends Pick<WishlistItem, 'variant_id'> {}

export type WishList<T> = T[];
