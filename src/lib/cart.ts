export type CartItem = {
  productId: string;
  storeId: string;
  storeSlug: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  stockQuantity: number;
  imageUrl: string | null;
  sku: string | null;
};

const KEY = "nexora-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("nexora-cart-updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((x) => x.productId === item.productId);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + item.quantity, existing.stockQuantity);
  } else {
    cart.push({ ...item, quantity: Math.min(item.quantity, item.stockQuantity) });
  }

  saveCart(cart);
}

export function updateCartQuantity(productId: string, quantity: number) {
  const cart = getCart();
  const item = cart.find((x) => x.productId === productId);
  if (!item) return;

  item.quantity = Math.max(1, Math.min(quantity, item.stockQuantity));
  saveCart(cart);
}

export function removeFromCart(productId: string) {
  saveCart(getCart().filter((x) => x.productId !== productId));
}

// Used by the cart page to reconcile a locally-stored item with the
// authoritative product row fetched from Supabase (price/stock may have
// drifted since the item was added). Never used to trust client-supplied
// price/stock for the actual order - the API re-validates everything again
// server-side regardless of what's synced here.
export function syncCartItem(
  productId: string,
  updates: Partial<Pick<CartItem, "price" | "stockQuantity">>
) {
  const cart = getCart();
  const item = cart.find((x) => x.productId === productId);
  if (!item) return;

  if (typeof updates.price === "number") item.price = updates.price;
  if (typeof updates.stockQuantity === "number") {
    item.stockQuantity = updates.stockQuantity;
    item.quantity = Math.min(item.quantity, Math.max(updates.stockQuantity, 0));
  }

  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}