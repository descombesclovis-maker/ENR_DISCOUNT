import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  PackageSearch,
  Search,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function CatalogSearchMenu() {
  const location = useLocation();

  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    openedCategories,
    setOpenedCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    setOpen(false);
    setSearchText("");
    setOpenedCategories([]);
  }, [
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    if (!open || loaded) {
      return;
    }

    let componentIsMounted = true;

    const loadCatalog = async () => {
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
              is_active,
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
              category_id,
              name,
              slug,
              brand,
              reference,
              is_active,
              categories (
                id,
                name,
                slug
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

        setProducts(
          productsResult.data || []
        );

        setLoaded(true);
      } catch (error) {
        console.error(
          "Erreur lors du chargement du catalogue :",
          error
        );

        if (!componentIsMounted) {
          return;
        }

        setErrorMessage(
          error?.message ||
            "Impossible de charger le catalogue."
        );
      } finally {
        if (componentIsMounted) {
          setLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      componentIsMounted = false;
    };
  }, [
    open,
    loaded,
  ]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutsideClick = (
      event
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    const handleEscapeKey = (
      event
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscapeKey
    );

    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscapeKey
      );
    };
  }, [open]);

  const normalizedSearchText =
    useMemo(
      () =>
        normalizeSearchText(
          searchText
        ),
      [searchText]
    );

  const groupedCategories =
    useMemo(() => {
      return categories
        .map((category) => {
          const categoryProducts =
            products.filter(
              (product) =>
                product.category_id ===
                category.id
            );

          if (!normalizedSearchText) {
            return {
              ...category,

              products:
                categoryProducts,
            };
          }

          const categoryMatches =
            normalizeSearchText(
              category.name
            ).includes(
              normalizedSearchText
            );

          const matchingProducts =
            categoryProducts.filter(
              (product) => {
                const searchableText =
                  normalizeSearchText(
                    [
                      product.name,
                      product.brand,
                      product.reference,
                      category.name,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  );

                return searchableText.includes(
                  normalizedSearchText
                );
              }
            );

          return {
            ...category,

            products:
              categoryMatches
                ? categoryProducts
                : matchingProducts,

            categoryMatches,
          };
        })
        .filter((category) => {
          if (!normalizedSearchText) {
            return true;
          }

          return (
            category.categoryMatches ||
            category.products.length > 0
          );
        });
    }, [
      categories,
      products,
      normalizedSearchText,
    ]);

  const uncategorizedProducts =
    useMemo(() => {
      const productsWithoutCategory =
        products.filter(
          (product) =>
            !product.category_id
        );

      if (!normalizedSearchText) {
        return productsWithoutCategory;
      }

      return productsWithoutCategory.filter(
        (product) => {
          const searchableText =
            normalizeSearchText(
              [
                product.name,
                product.brand,
                product.reference,
              ]
                .filter(Boolean)
                .join(" ")
            );

          return searchableText.includes(
            normalizedSearchText
          );
        }
      );
    }, [
      products,
      normalizedSearchText,
    ]);

  const totalVisibleProducts =
    useMemo(() => {
      const categorizedProductsCount =
        groupedCategories.reduce(
          (
            total,
            category
          ) =>
            total +
            category.products.length,
          0
        );

      return (
        categorizedProductsCount +
        uncategorizedProducts.length
      );
    }, [
      groupedCategories,
      uncategorizedProducts,
    ]);

  const handleToggleMenu = () => {
    setOpen(
      (currentValue) =>
        !currentValue
    );
  };

  const handleCloseMenu = () => {
    setOpen(false);
    setSearchText("");
    setOpenedCategories([]);
  };

  const handleRetry = () => {
    setLoaded(false);
    setErrorMessage("");
  };

  const isCategoryOpened = (
    categoryId
  ) =>
    openedCategories.includes(
      categoryId
    );

  const toggleCategory = (
    categoryId
  ) => {
    setOpenedCategories(
      (currentCategories) => {
        const categoryAlreadyOpened =
          currentCategories.includes(
            categoryId
          );

        if (categoryAlreadyOpened) {
          return currentCategories.filter(
            (currentCategoryId) =>
              currentCategoryId !==
              categoryId
          );
        }

        return [
          ...currentCategories,
          categoryId,
        ];
      }
    );
  };

  const otherProductsCategoryId =
    "uncategorized-products";

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
    >
      <button
        type="button"
        onClick={handleToggleMenu}
        aria-label={
          open
            ? "Fermer la recherche"
            : "Ouvrir la recherche"
        }
        aria-expanded={open}
        title="Rechercher un produit"
        className={`w-11 h-11 rounded-full border grid place-items-center transition-colors ${
          open
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-white text-slate-900 hover:bg-slate-100"
        }`}
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <Search className="w-5 h-5" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+14px)] z-[70] w-[min(92vw,720px)] max-h-[calc(100vh-110px)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
          <div className="border-b border-slate-200 bg-white p-4 sm:p-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />

              <input
                ref={searchInputRef}
                type="search"
                value={searchText}
                onChange={(event) => {
                  setSearchText(
                    event.target.value
                  );

                  setOpenedCategories([]);
                }}
                placeholder="Rechercher un produit, une marque ou une référence…"
                autoComplete="off"
                className="w-full h-12 rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchText("");
                    setOpenedCategories([]);
                  }}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 w-8 h-8 -translate-y-1/2 rounded-full grid place-items-center text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {!loading &&
              !errorMessage &&
              normalizedSearchText && (
                <p className="mt-3 text-xs text-slate-500">
                  {totalVisibleProducts}{" "}
                  {totalVisibleProducts > 1
                    ? "produits trouvés"
                    : "produit trouvé"}
                </p>
              )}
          </div>

          <div className="max-h-[calc(100vh-205px)] overflow-y-auto bg-white">
            {loading && (
              <div className="py-16 text-center">
                <LoaderCircle className="w-9 h-9 animate-spin text-primary mx-auto mb-4" />

                <p className="font-semibold text-slate-900">
                  Chargement du catalogue…
                </p>
              </div>
            )}

            {!loading &&
              errorMessage && (
                <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-5 py-10 text-center">
                  <AlertCircle className="w-9 h-9 text-red-600 mx-auto mb-4" />

                  <p className="font-display font-bold text-lg text-slate-900">
                    Impossible de charger le catalogue
                  </p>

                  <p className="text-sm text-slate-600 mt-2">
                    {errorMessage}
                  </p>

                  <button
                    type="button"
                    onClick={handleRetry}
                    className="h-10 px-5 mt-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                  >
                    Réessayer
                  </button>
                </div>
              )}

            {!loading &&
              !errorMessage &&
              groupedCategories.length ===
                0 &&
              uncategorizedProducts.length ===
                0 && (
                <div className="py-16 px-5 text-center">
                  <PackageSearch className="w-10 h-10 text-slate-400 mx-auto mb-4" />

                  <p className="font-display font-bold text-lg text-slate-900">
                    Aucun produit trouvé
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    Essaie avec un autre nom, une marque ou une référence.
                  </p>
                </div>
              )}

            {!loading &&
              !errorMessage &&
              groupedCategories.length >
                0 && (
                <div className="divide-y divide-slate-200">
                  {groupedCategories.map(
                    (category) => {
                      const categoryIsOpened =
                        isCategoryOpened(
                          category.id
                        );

                      return (
                        <section
                          key={category.id}
                          className="bg-white"
                        >
                          <div className="flex items-center bg-slate-100">
                            <Link
                              to={`/produits?categorie=${encodeURIComponent(
                                category.slug
                              )}`}
                              onClick={
                                handleCloseMenu
                              }
                              className="flex-1 min-w-0 px-5 sm:px-6 py-4 hover:bg-slate-200 transition-colors"
                            >
                              <span className="block font-display font-bold text-base text-slate-900">
                                {category.name}
                              </span>

                              <span className="block text-xs text-slate-500 mt-1">
                                {
                                  category.products
                                    .length
                                }{" "}
                                {category.products
                                  .length > 1
                                  ? "produits"
                                  : "produit"}
                              </span>
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                toggleCategory(
                                  category.id
                                )
                              }
                              aria-label={
                                categoryIsOpened
                                  ? `Fermer la catégorie ${category.name}`
                                  : `Ouvrir la catégorie ${category.name}`
                              }
                              aria-expanded={
                                categoryIsOpened
                              }
                              className="w-16 self-stretch border-l border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-200 hover:text-primary transition-colors"
                            >
                              <ChevronDown
                                className={`w-5 h-5 transition-transform duration-200 ${
                                  categoryIsOpened
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>

                          {categoryIsOpened && (
                            <div className="border-t border-slate-200 bg-white">
                              {category.products
                                .length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                  {category.products.map(
                                    (
                                      product
                                    ) => (
                                      <li
                                        key={
                                          product.id
                                        }
                                      >
                                        <Link
                                          to={`/produits/${product.slug}`}
                                          onClick={
                                            handleCloseMenu
                                          }
                                          className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors"
                                        >
                                          <span className="min-w-0">
                                            <span className="block text-sm font-semibold text-slate-900">
                                              {
                                                product.name
                                              }
                                            </span>

                                            {(product.brand ||
                                              product.reference) && (
                                              <span className="block text-xs text-slate-500 mt-1">
                                                {[
                                                  product.brand,
                                                  product.reference
                                                    ? `Réf. ${product.reference}`
                                                    : "",
                                                ]
                                                  .filter(
                                                    Boolean
                                                  )
                                                  .join(
                                                    " · "
                                                  )}
                                              </span>
                                            )}
                                          </span>

                                          <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                                        </Link>
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p className="px-5 sm:px-6 py-5 text-sm text-slate-500">
                                  Aucun produit dans cette catégorie.
                                </p>
                              )}

                              <Link
                                to={`/produits?categorie=${encodeURIComponent(
                                  category.slug
                                )}`}
                                onClick={
                                  handleCloseMenu
                                }
                                className="flex items-center justify-center gap-2 min-h-11 border-t border-slate-100 px-5 text-xs font-semibold text-primary hover:bg-slate-50"
                              >
                                Voir toute la catégorie

                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </div>
                          )}
                        </section>
                      );
                    }
                  )}
                </div>
              )}

            {!loading &&
              !errorMessage &&
              uncategorizedProducts.length >
                0 && (
                <section className="border-t border-slate-200 bg-white">
                  <div className="flex items-center bg-slate-100">
                    <div className="flex-1 px-5 sm:px-6 py-4">
                      <p className="font-display font-bold text-base text-slate-900">
                        Autres produits
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {
                          uncategorizedProducts.length
                        }{" "}
                        {uncategorizedProducts.length >
                        1
                          ? "produits"
                          : "produit"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleCategory(
                          otherProductsCategoryId
                        )
                      }
                      aria-label={
                        isCategoryOpened(
                          otherProductsCategoryId
                        )
                          ? "Fermer les autres produits"
                          : "Ouvrir les autres produits"
                      }
                      aria-expanded={isCategoryOpened(
                        otherProductsCategoryId
                      )}
                      className="w-16 self-stretch border-l border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-200 hover:text-primary transition-colors"
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isCategoryOpened(
                            otherProductsCategoryId
                          )
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {isCategoryOpened(
                    otherProductsCategoryId
                  ) && (
                    <ul className="border-t border-slate-200 divide-y divide-slate-100 bg-white">
                      {uncategorizedProducts.map(
                        (product) => (
                          <li
                            key={product.id}
                          >
                            <Link
                              to={`/produits/${product.slug}`}
                              onClick={
                                handleCloseMenu
                              }
                              className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors"
                            >
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-slate-900">
                                  {product.name}
                                </span>

                                {(product.brand ||
                                  product.reference) && (
                                  <span className="block text-xs text-slate-500 mt-1">
                                    {[
                                      product.brand,
                                      product.reference
                                        ? `Réf. ${product.reference}`
                                        : "",
                                    ]
                                      .filter(
                                        Boolean
                                      )
                                      .join(
                                        " · "
                                      )}
                                  </span>
                                )}
                              </span>

                              <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </section>
              )}

            {!loading &&
              !errorMessage && (
                <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 sm:p-5">
                  <Link
                    to="/produits"
                    onClick={
                      handleCloseMenu
                    }
                    className="flex items-center justify-center gap-2 h-12 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  >
                    Voir tout le catalogue

                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}