import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  LoaderCircle,
  Menu,
  PackageSearch,
  Search,
  X,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

export function CatalogMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [categories, setCategories] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    setMenuOpen(false);
    setSearch("");
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  useEffect(() => {
    let componentIsMounted = true;

    async function loadMenuData() {
      if (!menuOpen) {
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const [
          categoriesResult,
          productsResult,
        ] = await Promise.all([
          supabase
            .from("categories")
            .select(`
              id,
              name,
              slug,
              display_order
            `)
            .eq("is_active", true)
            .order("display_order", {
              ascending: true,
            })
            .order("name", {
              ascending: true,
            }),

          supabase
            .from("products")
            .select(`
              id,
              name,
              slug,
              brand,
              short_description,
              price,
              is_active,
              category_id,
              product_images (
                id,
                image_url,
                alt_text,
                is_primary,
                display_order
              )
            `)
            .eq("is_active", true)
            .order("name", {
              ascending: true,
            }),
        ]);

        if (categoriesResult.error) {
          throw categoriesResult.error;
        }

        if (productsResult.error) {
          throw productsResult.error;
        }

        if (!componentIsMounted) {
          return;
        }

        setCategories(
          categoriesResult.data || []
        );

        const normalizedProducts =
          (productsResult.data || []).map(
            (product) => {
              const images =
                Array.isArray(
                  product.product_images
                )
                  ? [
                      ...product.product_images,
                    ].sort(
                      (
                        firstImage,
                        secondImage
                      ) => {
                        if (
                          firstImage.is_primary &&
                          !secondImage.is_primary
                        ) {
                          return -1;
                        }

                        if (
                          !firstImage.is_primary &&
                          secondImage.is_primary
                        ) {
                          return 1;
                        }

                        return (
                          Number(
                            firstImage.display_order ||
                              0
                          ) -
                          Number(
                            secondImage.display_order ||
                              0
                          )
                        );
                      }
                    )
                  : [];

              return {
                ...product,
                primary_image:
                  images[0] || null,
              };
            }
          );

        setProducts(normalizedProducts);
      } catch (error) {
        console.error(
          "Erreur du menu catalogue :",
          error
        );

        if (componentIsMounted) {
          setErrorMessage(
            error?.message ||
              "Impossible de charger le catalogue."
          );
        }
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    }

    loadMenuData();

    return () => {
      componentIsMounted = false;
    };
  }, [menuOpen]);

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return products
      .filter((product) => {
        const searchableText = [
          product.name,
          product.brand,
          product.short_description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch
        );
      })
      .slice(0, 8);
  }, [
    normalizedSearch,
    products,
  ]);

  const handleProductClick = (
    productSlug
  ) => {
    setMenuOpen(false);
    setSearch("");

    navigate(
      `/produits/${productSlug}`
    );
  };

  const handleCategoryClick = (
    category
  ) => {
    setMenuOpen(false);
    setSearch("");

    navigate(
      `/produits?categorie=${encodeURIComponent(
        category.slug
      )}`
    );
  };

  const handleAllProductsClick = () => {
    setMenuOpen(false);
    setSearch("");

    navigate("/produits");
  };

  return (
    <div
      ref={menuRef}
      className="relative z-[100]"
    >
      <button
        type="button"
        onClick={() =>
          setMenuOpen(
            (currentValue) =>
              !currentValue
          )
        }
        aria-expanded={menuOpen}
        aria-label="Ouvrir le catalogue"
        className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full border border-border bg-card text-foreground font-semibold text-sm hover:bg-secondary transition-colors"
      >
        {menuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}

        <span className="hidden sm:inline">
          Catalogue
        </span>

        <ChevronDown
          className={`hidden sm:block w-4 h-4 transition-transform ${
            menuOpen
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le catalogue"
            onClick={() =>
              setMenuOpen(false)
            }
            className="fixed inset-0 z-40 bg-black/30"
          />

          <div className="fixed sm:absolute z-50 top-0 left-0 sm:top-full sm:left-0 sm:mt-3 w-full sm:w-[430px] h-full sm:h-auto sm:max-h-[75vh] bg-card border-r sm:border border-border sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
              <div>
                <p className="font-display font-black text-xl">
                  Catalogue
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  Rechercher ou parcourir les catégories
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="w-10 h-10 rounded-full border border-border grid place-items-center hover:bg-secondary"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

                <input
                  ref={searchInputRef}
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Rechercher un produit…"
                  className="w-full h-12 rounded-2xl border border-border bg-background pl-12 pr-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    aria-label="Effacer la recherche"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full grid place-items-center hover:bg-secondary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-145px)] sm:h-auto sm:max-h-[calc(75vh-145px)] p-4">
              {loading ? (
                <div className="py-16 text-center">
                  <LoaderCircle className="w-9 h-9 animate-spin text-primary mx-auto mb-4" />

                  <p className="font-semibold">
                    Chargement du catalogue…
                  </p>
                </div>
              ) : errorMessage ? (
                <div className="rounded-2xl bg-destructive/10 text-destructive p-4 text-sm">
                  {errorMessage}
                </div>
              ) : normalizedSearch ? (
                <section>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 mb-3">
                    Résultats
                  </p>

                  {filteredProducts.length ===
                  0 ? (
                    <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center">
                      <PackageSearch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />

                      <p className="font-semibold">
                        Aucun produit trouvé
                      </p>

                      <p className="text-sm text-muted-foreground mt-2">
                        Essaie avec un autre nom ou une autre marque.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredProducts.map(
                        (product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() =>
                              handleProductClick(
                                product.slug
                              )
                            }
                            className="w-full flex items-center gap-4 rounded-2xl p-3 text-left hover:bg-secondary transition-colors"
                          >
                            <div className="w-16 h-16 shrink-0 rounded-xl border border-border bg-white overflow-hidden grid place-items-center">
                              {product
                                .primary_image
                                ?.image_url ? (
                                <img
                                  src={
                                    product
                                      .primary_image
                                      .image_url
                                  }
                                  alt={
                                    product
                                      .primary_image
                                      .alt_text ||
                                    product.name
                                  }
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <PackageSearch className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold truncate">
                                {product.name}
                              </p>

                              {product.brand && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {product.brand}
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </section>
              ) : (
                <section>
                  <button
                    type="button"
                    onClick={
                      handleAllProductsClick
                    }
                    className="w-full flex items-center justify-between rounded-2xl bg-primary text-primary-foreground px-5 py-4 font-semibold mb-5"
                  >
                    <span>
                      Voir tous les produits
                    </span>

                    <span>→</span>
                  </button>

                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 mb-3">
                    Toutes les catégories
                  </p>

                  {categories.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                      Aucune catégorie disponible.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {categories.map(
                        (category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() =>
                              handleCategoryClick(
                                category
                              )
                            }
                            className="w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-left font-semibold text-sm hover:bg-secondary transition-colors"
                          >
                            <span>
                              {category.name}
                            </span>

                            <span className="text-muted-foreground">
                              →
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}