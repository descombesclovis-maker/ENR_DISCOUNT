import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PartnerCartContext = createContext(null);
const STORAGE_KEY = "qeh_partner_professional_cart";

function normalizeProduct(product, quantity) {
  const minimumQuantity = Math.max(1, Number(product.minimum_quantity || 1));
  const requestedQuantity = Math.max(
    minimumQuantity,
    Number.parseInt(quantity, 10) || minimumQuantity
  );

  return {
    cart_item_id: String(product.id),
    product_id: product.id,
    name: product.name || "Produit professionnel",
    reference: product.reference || null,
    description: product.description || "",
    image_url: product.image_url || "",
    price_excluding_tax: Number(product.price_excluding_tax || 0),
    vat_rate: Number(product.vat_rate ?? 20),
    stock: Number(product.stock || 0),
    minimum_quantity: minimumQuantity,
    quantity: requestedQuantity,
  };
}

export function PartnerCartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity) => {
    const normalized = normalizeProduct(product, quantity);

    setItems((current) => {
      const existing = current.find(
        (item) => item.cart_item_id === normalized.cart_item_id
      );

      if (!existing) return [...current, normalized];

      return current.map((item) => {
        if (item.cart_item_id !== normalized.cart_item_id) return item;
        const requested = item.quantity + normalized.quantity;
        const maximum = normalized.stock > 0 ? normalized.stock : requested;
        return { ...item, ...normalized, quantity: Math.min(requested, maximum) };
      });
    });
  }, []);

  const updateQuantity = useCallback((cartItemId, quantity) => {
    setItems((current) => current.map((item) => {
      if (item.cart_item_id !== cartItemId) return item;
      const minimum = Math.max(1, Number(item.minimum_quantity || 1));
      const requested = Math.max(minimum, Number.parseInt(quantity, 10) || minimum);
      const maximum = item.stock > 0 ? item.stock : requested;
      return { ...item, quantity: Math.min(requested, maximum) };
    }));
  }, []);

  const removeItem = useCallback((cartItemId) => {
    setItems((current) => current.filter(
      (item) => item.cart_item_id !== cartItemId
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totals = useMemo(() => items.reduce((result, item) => {
    const excludingTax = Number(item.price_excluding_tax) * Number(item.quantity);
    const tax = excludingTax * (Number(item.vat_rate) / 100);
    return {
      excludingTax: result.excludingTax + excludingTax,
      tax: result.tax + tax,
      includingTax: result.includingTax + excludingTax + tax,
      count: result.count + Number(item.quantity),
    };
  }, { excludingTax: 0, tax: 0, includingTax: 0, count: 0 }), [items]);

  const value = useMemo(() => ({
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    count: totals.count,
    subtotalExcludingTax: totals.excludingTax,
    taxAmount: totals.tax,
    totalIncludingTax: totals.includingTax,
  }), [items, addItem, updateQuantity, removeItem, clearCart, totals]);

  return (
    <PartnerCartContext.Provider value={value}>
      {children}
    </PartnerCartContext.Provider>
  );
}

export function usePartnerCart() {
  const context = useContext(PartnerCartContext);
  if (!context) {
    throw new Error("usePartnerCart doit être utilisé dans PartnerCartProvider.");
  }
  return context;
}