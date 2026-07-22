import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WishlistContext = createContext(null);

const STORAGE_KEY =
  "enr-discount-wishlist";

function loadWishlist() {
  try {
    const savedWishlist =
      localStorage.getItem(STORAGE_KEY);

    if (!savedWishlist) {
      return [];
    }

    const parsedWishlist =
      JSON.parse(savedWishlist);

    return Array.isArray(parsedWishlist)
      ? parsedWishlist
      : [];
  } catch (error) {
    console.error(
      "Impossible de charger les favoris :",
      error
    );

    return [];
  }
}

export function WishlistProvider({
  children,
}) {
  const [items, setItems] =
    useState(loadWishlist);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Impossible d’enregistrer les favoris :",
        error
      );
    }
  }, [items]);

  const value = useMemo(() => {
    const isFavorite = (
      productId
    ) =>
      items.some(
        (item) => item.id === productId
      );

    const addFavorite = (
      product
    ) => {
      if (!product?.id) {
        return;
      }

      setItems((currentItems) => {
        const alreadyExists =
          currentItems.some(
            (item) =>
              item.id === product.id
          );

        if (alreadyExists) {
          return currentItems;
        }

        return [
          ...currentItems,
          product,
        ];
      });
    };

    const removeFavorite = (
      productId
    ) => {
      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== productId
        )
      );
    };

    const toggleFavorite = (
      product
    ) => {
      if (!product?.id) {
        return;
      }

      setItems((currentItems) => {
        const alreadyExists =
          currentItems.some(
            (item) =>
              item.id === product.id
          );

        if (alreadyExists) {
          return currentItems.filter(
            (item) =>
              item.id !== product.id
          );
        }

        return [
          ...currentItems,
          product,
        ];
      });
    };

    const clearFavorites = () => {
      setItems([]);
    };

    return {
      items,
      count: items.length,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
    };
  }, [items]);

  return (
    <WishlistContext.Provider
      value={value}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context =
    useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist doit être utilisé à l’intérieur de WishlistProvider."
    );
  }

  return context;
}