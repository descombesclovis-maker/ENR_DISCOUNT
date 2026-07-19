import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "enr_cart";

function getCartItemId(product) {
  const databaseProductId =
    product.database_product_id ||
    product.product_id ||
    product.id ||
    product.slug;

  const variantId =
    product.variant_id ||
    product.selectedVariant?.id ||
    null;

  return variantId
    ? `${databaseProductId}-${variantId}`
    : databaseProductId;
}

function normalizeProduct(product, quantity) {
  const databaseProductId =
    product.database_product_id ||
    product.product_id ||
    product.id;

  const variantId =
    product.variant_id ||
    product.selectedVariant?.id ||
    null;

  return {
    cart_item_id: getCartItemId(product),

    product_id: databaseProductId,
    database_product_id: databaseProductId,
    variant_id: variantId,

    slug: product.slug || "",
    name: product.name || "Produit",
    brand: product.brand || null,

    reference:
      product.selectedVariant?.reference ||
      product.reference ||
      null,

    sku:
      product.selectedVariant?.sku ||
      product.sku ||
      null,

    price: Number(product.price || 0),
    stock: Number(product.stock || 0),

    image:
      product.image ||
      product.images?.[0] ||
      "",

    images: Array.isArray(product.images)
      ? product.images
      : product.image
        ? [product.image]
        : [],

    selectedVariant:
      product.selectedVariant || null,

    quantity: Math.max(
      1,
      Number.parseInt(quantity, 10) || 1
    ),
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const storedItems = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      return Array.isArray(storedItems)
        ? storedItems
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items]);

  const addItem = useCallback(
    (product, quantity = 1) => {
      const normalizedProduct =
        normalizeProduct(product, quantity);

      setItems((currentItems) => {
        const existingItem =
          currentItems.find(
            (item) =>
              item.cart_item_id ===
              normalizedProduct.cart_item_id
          );

        if (!existingItem) {
          return [
            ...currentItems,
            normalizedProduct,
          ];
        }

        return currentItems.map((item) => {
          if (
            item.cart_item_id !==
            normalizedProduct.cart_item_id
          ) {
            return item;
          }

          const requestedQuantity =
            item.quantity +
            normalizedProduct.quantity;

          const maximumQuantity =
            normalizedProduct.stock > 0
              ? normalizedProduct.stock
              : requestedQuantity;

          return {
            ...item,
            ...normalizedProduct,
            quantity: Math.min(
              requestedQuantity,
              maximumQuantity
            ),
          };
        });
      });
    },
    []
  );

  const removeItem = useCallback(
    (cartItemId) => {
      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            item.cart_item_id !== cartItemId
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (cartItemId, quantity) => {
      const nextQuantity =
        Number.parseInt(quantity, 10);

      if (
        Number.isNaN(nextQuantity) ||
        nextQuantity < 1
      ) {
        removeItem(cartItemId);
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) => {
          if (
            item.cart_item_id !== cartItemId
          ) {
            return item;
          }

          const maximumQuantity =
            item.stock > 0
              ? item.stock
              : nextQuantity;

          return {
            ...item,
            quantity: Math.min(
              nextQuantity,
              maximumQuantity
            ),
          };
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const count = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      count,
      total,
    }),
    [
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      count,
      total,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart doit être utilisé à l’intérieur de CartProvider."
    );
  }

  return context;
}