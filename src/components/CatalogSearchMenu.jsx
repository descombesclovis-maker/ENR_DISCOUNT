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
  Boxes,
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
        className={`w-11 h-11 rounded-full border grid place-items-center transition-all duration-200 ${
          open
            ? "border-[#ff5a00] bg-[#ff5a00] text-white shadow-[0_10px_30px_rgba(255,90,0,0.28)]"
            : "border-white/20 bg-white/5 text-white hover:border-[#0b5ca8] hover:bg-[#0b5ca8]/20"
        }`}
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <Search className="w-5 h-5" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+14px)] z-[70] w-[min(94vw,760px)] max-h-[calc(100vh-110px)] overflow-hidden rounded-3xl border border-[#0b5ca8]/35 bg-white text-slate-900 shadow-[0_28px_90px_rgba(2,7,20,0.35)]">
          <div className="relative overflow-hidden border-b border-white/10 bg-[#020714] p-4 sm:p-5">
            <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-[#0b5ca8]/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-[#ff5a00]/15 blur-3xl pointer-events-none" />

            <div className="relative mb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ff5a00]">
                QEH OUTLET
              </p>

              <h2 className="font-display font-black text-xl sm:text-2xl text-white mt-1">
                Catalogue et recherche
              </h2>

              <p className="text-xs sm:text-sm text-white/50 mt-1">
                Recherchez un produit ou explorez les catégories.
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 w-5 h-5 -translate-y-1/2 text-[#55a8ff]" />

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
                className="w-full h-12 rounded-2xl border border-white/15 bg-white/10 pl-12 pr-12 text-white placeholder:text-white/40 outline-none focus:border-[#0b5ca8] focus:ring-2 focus:ring-[#0b5ca8]/30"
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchText("");
                    setOpenedCategories([]);
                  }}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 w-8 h-8 -translate-y-1/2 rounded-full grid place-items-center text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {!loading &&
              !errorMessage &&
              normalizedSearchText && (
                <p className="relative mt-3 text-xs text-white/55">
                  {totalVisibleProducts}{" "}
                  {totalVisibleProducts > 1
                    ? "produits trouvés"
                    : "produit trouvé"}
                </p>
              )}
          </div>

          <div className="max-h-[calc(100vh-255px)] overflow-y-auto bg-slate-50">
            {loading && (
              <div className="py-16 text-center">
                <LoaderCircle className="w-9 h-9 animate-spin text-[#0b5ca8] mx-auto mb-4" />

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
                    className="h-10 px-5 mt-5 rounded-full bg-[#ff5a00] text-white text-sm font-bold hover:bg-[#e95000]"
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
                <div className="p-3 sm:p-4 space-y-3">
                  {groupedCategories.map(
                    (category) => {
                      const categoryIsOpened =
                        isCategoryOpened(
                          category.id
                        );

                      return (
                        <section
                          key={category.id}
                          className="overflow-hidden rounded-2xl border border-[#0b5ca8]/20 bg-white shadow-sm"
                        >
                          <div className="flex items-stretch bg-[linear-gradient(135deg,#020714_0%,#071b35_100%)]">
                            <Link
                              to={`/produits?categorie=${encodeURIComponent(
                                category.slug
                              )}`}
                              onClick={
                                handleCloseMenu
                              }
                              className="group flex-1 min-w-0 flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-white/5 transition-colors"
                            >
                              <span className="w-11 h-11 shrink-0 rounded-2xl border border-[#0b5ca8]/45 bg-[#0b5ca8]/15 text-[#55a8ff] grid place-items-center group-hover:border-[#ff5a00]/60 group-hover:text-[#ff5a00] transition-colors">
                                <Boxes className="w-5 h-5" />
                              </span>

                              <span className="min-w-0">
                                <span className="block font-display font-black text-base text-white truncate">
                                  {category.name}
                                </span>

                                <span className="inline-flex items-center min-h-6 px-2.5 mt-1.5 rounded-full bg-[#ff5a00]/15 text-[#ff8b4d] text-[11px] font-black">
                                  {
                                    category.products
                                      .length
                                  }{" "}
                                  {category.products
                                    .length > 1
                                    ? "produits"
                                    : "produit"}
                                </span>
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
                              className="w-16 self-stretch border-l border-white/10 grid place-items-center text-white/65 hover:bg-[#ff5a00] hover:text-white transition-colors"
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
                            <div className="border-t border-[#0b5ca8]/15 bg-white">
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
                                          className="group flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-[#0b5ca8]/5 transition-colors"
                                        >
                                          <span className="min-w-0">
                                            <span className="block text-sm font-bold text-slate-950 group-hover:text-[#0b5ca8] transition-colors">
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

                                          <span className="w-9 h-9 shrink-0 rounded-full bg-slate-100 text-slate-400 grid place-items-center group-hover:bg-[#ff5a00] group-hover:text-white transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                          </span>
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
                                className="flex items-center justify-center gap-2 min-h-12 border-t border-slate-100 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#0b5ca8] hover:bg-[#0b5ca8]/5 hover:text-[#ff5a00] transition-colors"
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
                <section className="mx-3 sm:mx-4 mb-4 overflow-hidden rounded-2xl border border-[#0b5ca8]/20 bg-white shadow-sm">
                  <div className="flex items-stretch bg-[linear-gradient(135deg,#020714_0%,#071b35_100%)]">
                    <div className="flex-1 px-5 sm:px-6 py-4">
                      <p className="font-display font-black text-base text-white">
                        Autres produits
                      </p>

                      <p className="text-xs font-bold text-[#ff8b4d] mt-1">
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
                      className="w-16 self-stretch border-l border-white/10 grid place-items-center text-white/65 hover:bg-[#ff5a00] hover:text-white transition-colors"
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
                    <ul className="border-t border-[#0b5ca8]/15 divide-y divide-slate-100 bg-white">
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
                <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 p-4 sm:p-5 backdrop-blur">
                  <Link
                    to="/produits"
                    onClick={
                      handleCloseMenu
                    }
                    className="flex items-center justify-center gap-2 h-12 rounded-full bg-[#ff5a00] text-white font-black hover:bg-[#e95000] transition-colors shadow-[0_12px_35px_rgba(255,90,0,0.22)]"
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