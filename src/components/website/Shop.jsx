// src/components/website/Shop.jsx

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Filter,
  Grid2X2,
  List,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ============================================================
// HELPERS
// ============================================================

const getProductId = (product) => {
  return product?._id || product?.id || product?.productId || "";
};

const getProductName = (product) => {
  return (
    product?.name ||
    product?.title ||
    product?.productName ||
    "Product"
  );
};

const getProductPrice = (product) => {
  return Number(
    product?.price ??
      product?.salePrice ??
      product?.sellingPrice ??
      product?.regularPrice ??
      0
  );
};

const getComparePrice = (product) => {
  return Number(
    product?.comparePrice ??
      product?.compare_at_price ??
      product?.mrp ??
      product?.originalPrice ??
      0
  );
};

const getProductImage = (product) => {
  const image =
    product?.image ||
    product?.imageUrl ||
    product?.thumbnail ||
    product?.featuredImage ||
    product?.images?.[0] ||
    product?.media?.[0];

  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image;
  }

  return image?.url || image?.src || image?.path || "";
};

const getProductCategory = (product) => {
  const category =
    product?.category ||
    product?.categoryName ||
    product?.category?.name ||
    product?.categories?.[0];

  if (!category) {
    return "";
  }

  if (typeof category === "string") {
    return category;
  }

  return category?.name || category?.title || "";
};

const getProductRating = (product) => {
  return Number(
    product?.rating ??
      product?.averageRating ??
      product?.reviews?.average ??
      0
  );
};

const isProductAvailable = (product) => {
  if (
    product?.available === false ||
    product?.isAvailable === false ||
    product?.inStock === false
  ) {
    return false;
  }

  if (product?.stock !== undefined && product?.stock !== null) {
    return Number(product.stock) > 0;
  }

  if (product?.quantity !== undefined && product?.quantity !== null) {
    return Number(product.quantity) > 0;
  }

  return true;
};

const formatPrice = (value, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  } catch {
    return `${currency} ${Number(value || 0)}`;
  }
};

// ============================================================
// PRODUCT CARD
// ============================================================

function ProductCard({
  product,
  currency,
  primaryColor,
  basePath,
  onAddToCart,
}) {
  const navigate = useNavigate();

  const id = getProductId(product);
  const name = getProductName(product);
  const price = getProductPrice(product);
  const comparePrice = getComparePrice(product);
  const image = getProductImage(product);
  const category = getProductCategory(product);
  const rating = getProductRating(product);
  const available = isProductAvailable(product);

  const discount =
    comparePrice > price && price > 0
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  const handleProductClick = () => {
    if (!id) return;

    navigate(
      `${basePath.replace(/\/$/, "")}/product/${id}`
    );
  };

  return (
    <article className="group min-w-0">
      {/* Image */}
      <button
        type="button"
        onClick={handleProductClick}
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gray-100 text-left"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No Image
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}

        {/* Out of stock */}
        {!available && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-gray-900 shadow-sm">
            Out of stock
          </span>
        )}

        {/* Wishlist */}
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur">
          <span className="text-base">♡</span>
        </span>
      </button>

      {/* Info */}
      <div className="pt-3">
        {category && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
            {category}
          </p>
        )}

        <button
          type="button"
          onClick={handleProductClick}
          className="mt-1 line-clamp-2 text-left text-sm font-semibold text-gray-900 transition hover:opacity-70"
        >
          {name}
        </button>

        {/* Rating */}
        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <Star
              size={12}
              fill="currentColor"
              style={{
                color: primaryColor,
              }}
            />

            <span className="text-[11px] font-medium text-gray-500">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span
            className="text-sm font-bold"
            style={{
              color: primaryColor,
            }}
          >
            {formatPrice(price, currency)}
          </span>

          {comparePrice > price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(comparePrice, currency)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        {available && (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="mt-3 h-9 w-full rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-800 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            Add to Cart
          </button>
        )}
      </div>
    </article>
  );
}

// ============================================================
// FILTER CONTENT
// ============================================================

function FilterContent({
  search,
  setSearch,
  categories,
  selectedCategories,
  setSelectedCategories,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  maxAvailablePrice,
  onlyAvailable,
  setOnlyAvailable,
  onApply,
  onClear,
  mobile = false,
}) {
  const toggleCategory = (category) => {
    setSelectedCategories((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category);
      }

      return [...current, category];
    });
  };

  return (
    <div className="space-y-7">
      {/* Search */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Search
        </label>

        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Category
          </label>

          {selectedCategories.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className="text-[11px] font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {categories.length === 0 ? (
            <p className="text-xs text-gray-400">
              No categories found
            </p>
          ) : (
            categories.map((category) => {
              const selected =
                selectedCategories.includes(category);

              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="flex items-center gap-3 text-sm text-gray-700">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        selected
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selected && <Check size={11} />}
                    </span>

                    {category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Price Range
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="mb-1 block text-[10px] text-gray-400">
              Min
            </span>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) =>
                  setMinPrice(event.target.value)
                }
                className="h-10 w-full rounded-lg border border-gray-200 pl-7 pr-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <div>
            <span className="mb-1 block text-[10px] text-gray-400">
              Max
            </span>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(event.target.value)
                }
                className="h-10 w-full rounded-lg border border-gray-200 pl-7 pr-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-gray-400">
          Maximum product price:{" "}
          {formatPrice(maxAvailablePrice, "INR")}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Availability
        </label>

        <button
          type="button"
          onClick={() =>
            setOnlyAvailable(!onlyAvailable)
          }
          className="flex items-center gap-3 text-sm text-gray-700"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              onlyAvailable
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white"
            }`}
          >
            {onlyAvailable && <Check size={11} />}
          </span>

          In Stock Only
        </button>
      </div>

      {/* Mobile Apply */}
      {mobile && (
        <div className="border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={onApply}
            className="h-12 w-full rounded-xl bg-gray-900 text-sm font-bold text-white"
          >
            Show Products
          </button>

          <button
            type="button"
            onClick={onClear}
            className="mt-2 h-11 w-full rounded-xl text-sm font-semibold text-gray-500"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHOP PAGE
// ============================================================

export default function Shop({
  website,
  products = [],
  categories = [],
  settings = {},
  currency = "INR",
  primaryColor = "#2563eb",
  basePath = "",
  onAddToCart,
}) {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] =
    useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [mobileFilterOpen, setMobileFilterOpen] =
    useState(false);

  // ==========================================================
  // NORMALIZE CATEGORIES
  // ==========================================================

  const categoryNames = useMemo(() => {
    const values = [];

    categories.forEach((category) => {
      const name =
        typeof category === "string"
          ? category
          : category?.name || category?.title;

      if (name) {
        values.push(name);
      }
    });

    products.forEach((product) => {
      const name = getProductCategory(product);

      if (name) {
        values.push(name);
      }
    });

    return [...new Set(values)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [categories, products]);

  // ==========================================================
  // MAX PRICE
  // ==========================================================

  const maxAvailablePrice = useMemo(() => {
    if (!products.length) {
      return 0;
    }

    return Math.max(
      ...products.map(getProductPrice),
      0
    );
  }, [products]);

  // ==========================================================
  // FILTER PRODUCTS
  // ==========================================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        const name =
          getProductName(product).toLowerCase();

        const category =
          getProductCategory(product).toLowerCase();

        const sku = String(
          product?.sku || product?.SKU || ""
        ).toLowerCase();

        return (
          name.includes(searchValue) ||
          category.includes(searchValue) ||
          sku.includes(searchValue)
        );
      });
    }

    // Category
    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.includes(
          getProductCategory(product)
        )
      );
    }

    // Minimum price
    if (minPrice !== "" && Number(minPrice) >= 0) {
      result = result.filter(
        (product) =>
          getProductPrice(product) >= Number(minPrice)
      );
    }

    // Maximum price
    if (maxPrice !== "" && Number(maxPrice) >= 0) {
      result = result.filter(
        (product) =>
          getProductPrice(product) <= Number(maxPrice)
      );
    }

    // Availability
    if (onlyAvailable) {
      result = result.filter(isProductAvailable);
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) =>
            getProductPrice(a) -
            getProductPrice(b)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            getProductPrice(b) -
            getProductPrice(a)
        );
        break;

      case "name":
        result.sort((a, b) =>
          getProductName(a).localeCompare(
            getProductName(b)
          )
        );
        break;

      case "newest":
        result.sort((a, b) => {
          const dateA = new Date(
            a?.createdAt ||
              a?.created_at ||
              0
          ).getTime();

          const dateB = new Date(
            b?.createdAt ||
              b?.created_at ||
              0
          ).getTime();

          return dateB - dateA;
        });
        break;

      default:
        break;
    }

    return result;
  }, [
    products,
    search,
    selectedCategories,
    minPrice,
    maxPrice,
    onlyAvailable,
    sortBy,
  ]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setOnlyAvailable(false);
  };

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    try {
      const saved =
        localStorage.getItem("website_cart");

      const currentCart = saved
        ? JSON.parse(saved)
        : [];

      const id = getProductId(product);

      const existingIndex =
        currentCart.findIndex(
          (item) =>
            String(item.id) === String(id)
        );

      if (existingIndex >= 0) {
        currentCart[existingIndex].quantity =
          Number(
            currentCart[existingIndex].quantity || 1
          ) + 1;
      } else {
        currentCart.push({
          id,
          name: getProductName(product),
          image: getProductImage(product),
          price: getProductPrice(product),
          quantity: 1,
        });
      }

      localStorage.setItem(
        "website_cart",
        JSON.stringify(currentCart)
      );

      window.dispatchEvent(
        new Event("website-cart-updated")
      );
    } catch (error) {
      console.error(
        "Unable to add to cart:",
        error
      );
    }
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(basePath || "/");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* ======================================================
          CHECKOUT STYLE HEADER
      ======================================================= */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left - Back */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 transition hover:text-gray-500"
          >
            <ArrowLeft size={18} />

            <span>Back</span>
          </button>

          {/* Right - Secure */}
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={19}
              style={{
                color: primaryColor,
              }}
            />

            <span className="text-sm font-bold text-gray-900">
              Secure Shopping
            </span>
          </div>
        </div>
      </header>

      {/* ======================================================
          SHOP TITLE
      ======================================================= */}

      <div className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{
                  color: primaryColor,
                }}
              >
                Collection
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                Shop
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "product"
                  : "products"}
              </p>
            </div>

            {/* Desktop Controls */}
            <div className="hidden items-center gap-3 md:flex">
              {/* View */}
              <div className="flex items-center rounded-lg border border-gray-200 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setViewMode("grid")
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    viewMode === "grid"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  <Grid2X2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode("list")
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    viewMode === "list"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  className="h-10 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-9 text-sm font-medium text-gray-700 outline-none focus:border-gray-400"
                >
                  <option value="featured">
                    Featured
                  </option>

                  <option value="newest">
                    Newest
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="name">
                    Name: A-Z
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* ==================================================
              DESKTOP FILTER
          =================================================== */}

          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-950">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-gray-400 transition hover:text-gray-900"
                >
                  Clear all
                </button>
              </div>

              <FilterContent
                search={search}
                setSearch={setSearch}
                categories={categoryNames}
                selectedCategories={
                  selectedCategories
                }
                setSelectedCategories={
                  setSelectedCategories
                }
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                maxAvailablePrice={
                  maxAvailablePrice
                }
                onlyAvailable={onlyAvailable}
                setOnlyAvailable={
                  setOnlyAvailable
                }
                onApply={() => {}}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* ==================================================
              PRODUCTS
          =================================================== */}

          <section>
            {/* =================================================
                IMPORTANT:
                Mobile top Filter/Sort controls REMOVED.
                Only bottom Filter + Sort remains.
            ================================================= */}

            {/* Active filters */}
            {(search ||
              selectedCategories.length > 0 ||
              minPrice ||
              maxPrice ||
              onlyAvailable) && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-400">
                  Active:
                </span>

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    Search: {search}
                    <X size={11} />
                  </button>
                )}

                {selectedCategories.map(
                  (category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() =>
                        setSelectedCategories(
                          (current) =>
                            current.filter(
                              (item) =>
                                item !== category
                            )
                        )
                      }
                      className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      {category}
                      <X size={11} />
                    </button>
                  )
                )}

                {(minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    Price
                    <X size={11} />
                  </button>
                )}

                {onlyAvailable && (
                  <button
                    type="button"
                    onClick={() =>
                      setOnlyAvailable(false)
                    }
                    className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    In Stock
                    <X size={11} />
                  </button>
                )}
              </div>
            )}

            {/* No products */}
            {filteredProducts.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <Search
                    size={22}
                    className="text-gray-400"
                  />
                </div>

                <h3 className="mt-4 text-base font-bold text-gray-900">
                  No products found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Try changing your search or
                  filters to find what you're
                  looking for.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-xs font-bold text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "list"
                    ? "space-y-5"
                    : "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4"
                }
              >
                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={String(
                        getProductId(product)
                      )}
                      product={product}
                      currency={currency}
                      primaryColor={
                        primaryColor
                      }
                      basePath={basePath}
                      onAddToCart={
                        handleAddToCart
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ======================================================
          MOBILE FILTER DRAWER
      ======================================================= */}

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setMobileFilterOpen(false)
            }
            className="absolute inset-0 bg-black/40"
          />

          {/* Drawer */}
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-base font-black text-gray-950">
                  Filters
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Refine your products
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileFilterOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="max-h-[calc(88vh-73px)] overflow-y-auto px-5 py-5">
              <FilterContent
                search={search}
                setSearch={setSearch}
                categories={categoryNames}
                selectedCategories={
                  selectedCategories
                }
                setSelectedCategories={
                  setSelectedCategories
                }
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                maxAvailablePrice={
                  maxAvailablePrice
                }
                onlyAvailable={onlyAvailable}
                setOnlyAvailable={
                  setOnlyAvailable
                }
                mobile
                onApply={() =>
                  setMobileFilterOpen(false)
                }
                onClear={() => {
                  clearFilters();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          MOBILE BOTTOM BAR
          ONLY FILTER + SORT
      ======================================================= */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center">
          {/* Filter */}
          <button
            type="button"
            onClick={() =>
              setMobileFilterOpen(true)
            }
            className="flex flex-1 items-center justify-center gap-2 border-r border-gray-200 text-sm font-bold text-gray-800"
          >
            <Filter size={17} />

            Filter

            {(selectedCategories.length > 0 ||
              search ||
              minPrice ||
              maxPrice ||
              onlyAvailable) && (
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] text-white"
                style={{
                  backgroundColor:
                    primaryColor,
                }}
              >
                {selectedCategories.length +
                  (search ? 1 : 0) +
                  (minPrice || maxPrice ? 1 : 0) +
                  (onlyAvailable ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Sort */}
          <button
            type="button"
            onClick={() => {
              const order = [
                "featured",
                "newest",
                "price-low",
                "price-high",
              ];

              const currentIndex =
                order.indexOf(sortBy);

              const next =
                order[
                  (currentIndex + 1) %
                    order.length
                ];

              setSortBy(next);
            }}
            className="flex flex-1 items-center justify-center gap-2 text-sm font-bold text-gray-800"
          >
            <SlidersHorizontal size={17} />

            Sort
          </button>
        </div>
      </div>
    </div>
  );
}