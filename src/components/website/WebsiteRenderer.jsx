// src/components/website/WebsiteRenderer.jsx

import React, { useMemo } from "react";

import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Undo2,
  User,
} from "lucide-react";

// ======================================================
// HELPERS
// ======================================================

const PRODUCT_TYPES = [
  "products",
  "featured_products",
  "trending_products",
  "new_arrivals",
  "deal_of_day",
];

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
};

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const formatPrice = (value, currency = "₹") => {
  const amount = safeNumber(value, 0);

  try {
    return `${currency}${amount.toLocaleString("en-IN")}`;
  } catch {
    return `${currency}${amount}`;
  }
};

const getProductId = (product) =>
  product?._id || product?.id || product?.productId || "";

const getCategoryId = (category) =>
  category?._id || category?.id || category?.categoryId || "";

const getProductName = (product) =>
  product?.name || product?.title || product?.productName || "Product";

const getCategoryName = (category) =>
  category?.name || category?.title || category?.categoryName || "Category";

const getProductImage = (product) =>
  product?.image ||
  product?.imageUrl ||
  product?.thumbnail ||
  product?.featuredImage ||
  product?.featured_image ||
  product?.images?.[0]?.url ||
  product?.images?.[0] ||
  product?.media?.[0]?.url ||
  "";

const getCategoryImage = (category) =>
  category?.image ||
  category?.imageUrl ||
  category?.thumbnail ||
  category?.featuredImage ||
  category?.featured_image ||
  category?.images?.[0]?.url ||
  category?.images?.[0] ||
  "";

const getProductPrice = (product) =>
  product?.price ??
  product?.salePrice ??
  product?.sellingPrice ??
  product?.selling_price ??
  product?.amount ??
  0;

const getProductOriginalPrice = (product) =>
  product?.compareAtPrice ??
  product?.compare_price ??
  product?.originalPrice ??
  product?.mrp ??
  product?.regularPrice ??
  null;

const getProductRating = (product) =>
  safeNumber(
    product?.rating ?? product?.averageRating ?? product?.avgRating ?? 0,
  );

const getProductUrl = (product) => {
  if (product?.slug) {
    return `/products/${product.slug}`;
  }

  if (getProductId(product)) {
    return `/products/${getProductId(product)}`;
  }

  return "/products";
};

const getCategoryUrl = (category) => {
  if (category?.slug) {
    return `/categories/${category.slug}`;
  }

  if (getCategoryId(category)) {
    return `/categories/${getCategoryId(category)}`;
  }

  return "/categories";
};

const isExternalUrl = (url) =>
  typeof url === "string" && /^https?:\/\//i.test(url);

const getLink = (url, fallback = "#") => url || fallback;

// ======================================================
// NORMALIZE SECTIONS
// ======================================================

export function normalizeSections(input) {
  const sections = normalizeArray(input);

  return sections
    .map((section, index) => {
      if (!section) {
        return null;
      }

      const type = section.type || section.sectionType || "text";

      const product = PRODUCT_TYPES.includes(type);

      return {
        id: section.id || section._id || `${type}-${index}`,

        type,

        enabled: section.enabled !== false,

        sortOrder: Number(section.sortOrder) || index + 1,

        layout: section.layout || (product ? "grid" : "default"),

        badge: section.badge || "",

        title: section.title || "",

        highlight: section.highlight || "",

        subtitle: section.subtitle || "",

        description: section.description || "",

        image: section.image || "",

        background: section.background || "",

        limit: Number(section.limit) || (product ? 8 : 8),

        source: section.source || (product ? "api" : "manual"),

        showPrice: section.showPrice !== false,

        showRating: section.showRating === true,

        showAddToCart: section.showAddToCart !== false,

        showCountdown: section.showCountdown === true,

        showDiscount: section.showDiscount === true,

        placeholder: section.placeholder || "Enter your email",

        discount: section.discount || "",

        textAlign: section.textAlign || "left",

        contentWidth: section.contentWidth || "medium",

        backgroundColor: section.backgroundColor || "",

        textColor: section.textColor || "",

        accentColor: section.accentColor || "",

        overlay: section.overlay === true,

        overlayOpacity: safeNumber(section.overlayOpacity, 40),

        paddingTop: safeNumber(section.paddingTop, 64),

        paddingBottom: safeNumber(section.paddingBottom, 64),

        borderRadius: safeNumber(section.borderRadius, 0),

        button: {
          label: section.button?.label || "",

          url: section.button?.url || "",

          action: section.button?.action || "",
        },

        secondaryButton: {
          label: section.secondaryButton?.label || "",

          url: section.secondaryButton?.url || "",

          action: section.secondaryButton?.action || "",
        },

        items: Array.isArray(section.items) ? section.items : [],

        settings: section.settings || {},
      };
    })
    .filter(Boolean)
    .sort((a, b) => safeNumber(a.sortOrder, 0) - safeNumber(b.sortOrder, 0));
}

// ======================================================
// CLASS HELPERS
// ======================================================

function getContentWidthClass(width) {
  switch (width) {
    case "small":
      return "max-w-2xl";

    case "large":
      return "max-w-6xl";

    case "full":
      return "max-w-none";

    case "medium":
    default:
      return "max-w-4xl";
  }
}

function getTextAlignClass(align) {
  switch (align) {
    case "center":
      return "text-center";

    case "right":
      return "text-right";

    case "left":
    default:
      return "text-left";
  }
}

function getGridClass(limit) {
  if (limit <= 2) {
    return "grid-cols-1 sm:grid-cols-2";
  }

  if (limit === 3) {
    return "grid-cols-2 md:grid-cols-3";
  }

  if (limit === 4) {
    return "grid-cols-2 md:grid-cols-4";
  }

  return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
}

// ======================================================
// DEFAULT ICON
// ======================================================

function TrustIcon({ type }) {
  if (type === "shield") {
    return <ShieldCheck size={25} />;
  }

  if (type === "return") {
    return <Undo2 size={25} />;
  }

  if (type === "user") {
    return <User size={25} />;
  }

  return <Truck size={25} />;
}

// ======================================================
// BUTTON
// ======================================================

function ActionButton({ button, secondary = false, accentColor }) {
  if (!button?.label) {
    return null;
  }

  const href = button.url || "#";

  const style = accentColor
    ? {
        borderColor: accentColor,
        backgroundColor: secondary ? "transparent" : accentColor,
      }
    : undefined;

  return (
    <a
      href={getLink(href)}
      target={isExternalUrl(href) ? "_blank" : undefined}
      rel={isExternalUrl(href) ? "noreferrer" : undefined}
      style={style}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
        secondary
          ? "border-2 border-white bg-transparent text-white hover:bg-white hover:text-gray-900"
          : "bg-gray-950 text-white hover:opacity-90"
      }`}
    >
      {button.label}

      <ArrowRight size={16} />
    </a>
  );
}

// ======================================================
// SECTION WRAPPER
// ======================================================

function SectionWrapper({
  section,
  children,
  className = "",
  fullWidth = false,
}) {
  if (section?.enabled === false) {
    return null;
  }

  const hasBackgroundImage = !!section.background;

  const style = {
    backgroundColor: section.backgroundColor || undefined,

    color: section.textColor || undefined,

    paddingTop: `${section.paddingTop ?? 15}px`,

    paddingBottom: `${section.paddingBottom ?? 15}px`,

    borderRadius: section.borderRadius
      ? `${section.borderRadius}px`
      : undefined,

    backgroundImage: hasBackgroundImage
      ? `url("${section.background}")`
      : undefined,

    backgroundSize: hasBackgroundImage ? "cover" : undefined,

    backgroundPosition: hasBackgroundImage ? "center" : undefined,

    position: "relative",
  };

  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
      style={style}
    >
      {hasBackgroundImage && section.overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity: safeNumber(section.overlayOpacity, 40) / 100,
          }}
        />
      )}

      <div
        className={`relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8 ${
          fullWidth ? "max-w-none" : getContentWidthClass(section.contentWidth)
        }`}
      >
        {children}
      </div>
    </section>
  );
}

// ======================================================
// SECTION HEADER
// ======================================================

function SectionHeader({ section }) {
  if (!section.title && !section.description && !section.badge) {
    return null;
  }

  return (
    <div className={`mb-8 ${getTextAlignClass(section.textAlign)}`}>
      {section.badge && (
        <div
          className="mb-2 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
          style={{
            color: section.accentColor || undefined,

            backgroundColor: section.accentColor
              ? `${section.accentColor}15`
              : "#f3f4f6",
          }}
        >
          {section.badge}
        </div>
      )}

      {section.title && (
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
          {section.title}

          {section.highlight && (
            <>
              {" "}
              <span
                style={{
                  color: section.accentColor || undefined,
                }}
              >
                {section.highlight}
              </span>
            </>
          )}
        </h2>
      )}

      {section.subtitle && (
        <div className="mt-2 text-sm font-semibold opacity-70">
          {section.subtitle}
        </div>
      )}

      {section.description && (
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 opacity-70">
          {section.description}
        </p>
      )}
    </div>
  );
}

// ======================================================
// HERO
// ======================================================

function HeroSection({ section }) {
  const style = {
    minHeight: "560px",

    backgroundColor: section.backgroundColor || "#111827",

    color: section.textColor || "#ffffff",

    paddingTop: `${section.paddingTop ?? 80}px`,

    paddingBottom: `${section.paddingBottom ?? 80}px`,
  };

  if (section.background) {
    style.backgroundImage = `url("${section.background}")`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }

  return (
    <section
      className="relative flex min-h-[520px] items-center overflow-hidden"
      style={style}
    >
      {section.background && section.overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity: safeNumber(section.overlayOpacity, 35) / 100,
          }}
        />
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div
          className={`max-w-3xl ${
            section.textAlign === "center"
              ? "mx-auto text-center"
              : section.textAlign === "right"
                ? "ml-auto text-right"
                : "text-left"
          }`}
        >
          {section.badge && (
            <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">
              {section.badge}
            </div>
          )}

          {section.title && (
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
              {section.title}

              {section.highlight && (
                <>
                  {" "}
                  <span
                    style={{
                      color: section.accentColor || "#ffffff",
                    }}
                  >
                    {section.highlight}
                  </span>
                </>
              )}
            </h1>
          )}

          {section.subtitle && (
            <p className="mt-4 text-base font-semibold opacity-90 sm:text-lg">
              {section.subtitle}
            </p>
          )}

          {section.description && (
            <p className="mt-5 max-w-2xl text-sm leading-7 opacity-80 sm:text-base">
              {section.description}
            </p>
          )}

          {(section.button?.label || section.secondaryButton?.label) && (
            <div
              className={`mt-8 flex flex-wrap gap-3 ${
                section.textAlign === "center"
                  ? "justify-center"
                  : section.textAlign === "right"
                    ? "justify-end"
                    : "justify-start"
              }`}
            >
              <ActionButton
                button={section.button}
                accentColor={section.accentColor}
              />

              <ActionButton
                button={section.secondaryButton}
                secondary
                accentColor={section.accentColor}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ======================================================
// TRUST FEATURES
// ======================================================

function TrustFeaturesSection({ section }) {
  const items = section.items?.length
    ? section.items
    : [
        {
          title: "Free Shipping",
          description: "Free shipping on selected orders.",
          icon: "truck",
        },
        {
          title: "Secure Payment",
          description: "100% secure and protected checkout.",
          icon: "shield",
        },
        {
          title: "Easy Returns",
          description: "Simple and hassle-free returns.",
          icon: "return",
        },
      ];

  return (
    <SectionWrapper section={section}>
      <SectionHeader section={section} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.id || item._id || index}
            className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: section.accentColor
                  ? `${section.accentColor}15`
                  : "#f3f4f6",

                color: section.accentColor || "#111827",
              }}
            >
              <TrustIcon type={item.icon} />
            </div>

            <div>
              <h3 className="font-black">{item.title || "Feature"}</h3>

              <p className="mt-1 text-sm leading-6 opacity-60">
                {item.description || ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ======================================================
// CATEGORY CARD
// ======================================================

function CategoryCard({ category }) {
  const image = getCategoryImage(category);

  return (
    <a
      href={getCategoryUrl(category)}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={getCategoryName(category)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <ShoppingBag size={32} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="font-black">{getCategoryName(category)}</div>

          <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
            Explore
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </a>
  );
}

// ======================================================
// CATEGORIES
// ======================================================

function CategoriesSection({ section, categories }) {
  const items = categories.slice(0, section.limit || 8);

  return (
    <SectionWrapper section={section}>
      <SectionHeader section={section} />

      {items.length === 0 ? (
        <EmptyState text="No categories available." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((category, index) => (
            <CategoryCard
              key={getCategoryId(category) || index}
              category={category}
            />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}

// ======================================================
// PRODUCT CARD
// ======================================================

function ProductCard({ product, section }) {
  const image = getProductImage(product);

  const price = getProductPrice(product);

  const originalPrice = getProductOriginalPrice(product);

  const rating = getProductRating(product);

  const name = getProductName(product);

  const href = getProductUrl(product);

  const discount =
    originalPrice && Number(originalPrice) > Number(price)
      ? Math.round(
          ((Number(originalPrice) - Number(price)) / Number(originalPrice)) *
            100,
        )
      : null;

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <a href={href} className="block h-full w-full">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <ShoppingBag size={34} />
            </div>
          )}
        </a>

        {section.showDiscount && discount && (
          <div className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white">
            -{discount}%
          </div>
        )}

        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur hover:bg-white"
        >
          <Heart size={16} />
        </button>

        {section.showAddToCart && (
          <a
            href={`${href}?action=cart`}
            className="absolute bottom-3 left-3 right-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-white/95 text-xs font-black shadow-lg backdrop-blur transition hover:bg-gray-950 hover:text-white"
          >
            <ShoppingBag size={15} />
            Add to Cart
          </a>
        )}
      </div>

      <div className="p-4">
        <a
          href={href}
          className="block truncate text-sm font-bold hover:underline"
        >
          {name}
        </a>

        {section.showRating && (
          <div className="mt-2 flex items-center gap-1">
            <div className="flex">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <Star
                  key={index}
                  size={12}
                  fill={index < Math.round(rating) ? "currentColor" : "none"}
                  className={
                    index < Math.round(rating)
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>

            {rating > 0 && (
              <span className="text-[10px] text-gray-400">
                {rating.toFixed(1)}
              </span>
            )}
          </div>
        )}

        {section.showPrice && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-black">{formatPrice(price)}</span>

            {originalPrice && Number(originalPrice) > Number(price) && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ======================================================
// PRODUCT SECTION
// ======================================================

function ProductsSection({ section, products }) {
  const items = products.slice(0, section.limit || 8);

  if (section.layout === "carousel") {
    return (
      <SectionWrapper section={section}>
        <SectionHeader section={section} />

        {items.length === 0 ? (
          <EmptyState text="No products available." />
        ) : (
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none]">
              {items.map((product, index) => (
                <div
                  key={getProductId(product) || index}
                  className="w-[220px] shrink-0 sm:w-[250px]"
                >
                  <ProductCard product={product} section={section} />
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper section={section}>
      <SectionHeader section={section} />

      {items.length === 0 ? (
        <EmptyState text="No products available." />
      ) : (
        <div
          className={`grid gap-4 sm:gap-5 ${getGridClass(section.limit || 8)}`}
        >
          {items.map((product, index) => (
            <ProductCard
              key={getProductId(product) || index}
              product={product}
              section={section}
            />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}

// ======================================================
// PROMO BANNER
// ======================================================

function PromoBannerSection({ section }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: `${section.paddingTop ?? 64}px`,

        paddingBottom: `${section.paddingBottom ?? 64}px`,

        backgroundColor: section.backgroundColor || "#111827",

        color: section.textColor || "#ffffff",
      }}
    >
      {section.background && (
        <img
          src={section.background}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {section.overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity: safeNumber(section.overlayOpacity, 40) / 100,
          }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div
          className={`max-w-3xl ${
            section.textAlign === "center"
              ? "mx-auto text-center"
              : section.textAlign === "right"
                ? "ml-auto text-right"
                : ""
          }`}
        >
          {section.badge && (
            <div className="mb-3 text-xs font-black uppercase tracking-widest opacity-70">
              {section.badge}
            </div>
          )}

          {section.title && (
            <h2 className="text-3xl font-black sm:text-5xl">{section.title}</h2>
          )}

          {section.description && (
            <p className="mt-4 max-w-xl text-sm leading-7 opacity-80">
              {section.description}
            </p>
          )}

          {section.button?.label && (
            <div className="mt-7">
              <ActionButton
                button={section.button}
                accentColor={section.accentColor}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ======================================================
// WHY CHOOSE US
// ======================================================

function WhyChooseUsSection({ section }) {
  return (
    <SectionWrapper section={section}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionHeader
            section={{
              ...section,
              textAlign: section.textAlign || "left",
            }}
          />

          <div className="mt-6 space-y-4">
            {[
              "Quality products",
              "Secure shopping experience",
              "Fast and reliable support",
              "Easy returns and assistance",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: section.accentColor
                      ? `${section.accentColor}15`
                      : "#f3f4f6",

                    color: section.accentColor || "#111827",
                  }}
                >
                  <Check size={16} />
                </div>

                <span className="text-sm font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {section.image ? (
          <div className="overflow-hidden rounded-3xl">
            <img
              src={section.image}
              alt=""
              className="aspect-[4/3] h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gray-100 text-gray-400">
            <ShoppingBag size={48} />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

// ======================================================
// TESTIMONIALS
// ======================================================

function TestimonialsSection({ section }) {
  const testimonials = section.items?.length
    ? section.items
    : [
        {
          name: "Sarah",
          role: "Customer",
          rating: 5,
          text: "Amazing products and great shopping experience.",
        },
        {
          name: "Rahul",
          role: "Customer",
          rating: 5,
          text: "Fast delivery and excellent quality.",
        },
        {
          name: "Emma",
          role: "Customer",
          rating: 5,
          text: "Beautiful collection. I will definitely shop again.",
        },
      ];

  return (
    <SectionWrapper section={section}>
      <SectionHeader section={section} />

      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((item, index) => (
          <div
            key={item.id || item._id || index}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex gap-1">
              {Array.from({
                length: 5,
              }).map((_, starIndex) => (
                <Star
                  key={starIndex}
                  size={14}
                  fill={
                    starIndex < Number(item.rating || 5)
                      ? "currentColor"
                      : "none"
                  }
                  className={
                    starIndex < Number(item.rating || 5)
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>

            <p className="mt-4 text-sm leading-7 text-gray-600">
              “{item.text || item.description || "Great experience."}”
            </p>

            <div className="mt-5 border-t pt-4">
              <div className="text-sm font-black">
                {item.name || "Customer"}
              </div>

              <div className="mt-1 text-xs text-gray-400">
                {item.role || "Customer"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ======================================================
// NEWSLETTER
// ======================================================

function NewsletterSection({ section }) {
  return (
    <SectionWrapper section={section} className="bg-gray-950">
      <div className="mx-auto max-w-3xl text-center text-white">
        {section.badge && (
          <div className="mb-3 text-xs font-black uppercase tracking-widest opacity-60">
            {section.badge}
          </div>
        )}

        {section.title && (
          <h2 className="text-3xl font-black sm:text-4xl">{section.title}</h2>
        )}

        {section.description && (
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/60">
            {section.description}
          </p>
        )}

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-7 flex max-w-xl flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Mail
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              placeholder={section.placeholder || "Enter your email"}
              className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            className="h-12 rounded-xl bg-white px-6 text-sm font-black text-gray-950 hover:bg-gray-100"
          >
            Subscribe
          </button>
        </form>
      </div>
    </SectionWrapper>
  );
}

// ======================================================
// CTA
// ======================================================

function CTASection({ section }) {
  return (
    <SectionWrapper section={section}>
      <div className="rounded-3xl bg-gray-100 px-6 py-12 text-center sm:px-10">
        {section.badge && (
          <div
            className="mb-3 text-xs font-black uppercase tracking-widest"
            style={{
              color: section.accentColor || undefined,
            }}
          >
            {section.badge}
          </div>
        )}

        {section.title && (
          <h2 className="text-3xl font-black sm:text-4xl">{section.title}</h2>
        )}

        {section.description && (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-600">
            {section.description}
          </p>
        )}

        {section.button?.label && (
          <div className="mt-7">
            <ActionButton
              button={section.button}
              accentColor={section.accentColor}
            />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

// ======================================================
// TEXT SECTION
// ======================================================

function TextSection({ section }) {
  return (
    <SectionWrapper section={section}>
      <div className={getTextAlignClass(section.textAlign)}>
        {section.badge && (
          <div
            className="mb-3 text-xs font-black uppercase tracking-widest"
            style={{
              color: section.accentColor || undefined,
            }}
          >
            {section.badge}
          </div>
        )}

        {section.title && (
          <h2 className="text-3xl font-black">{section.title}</h2>
        )}

        {section.description && (
          <div className="mt-5 whitespace-pre-line text-sm leading-8 opacity-70">
            {section.description}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

// ======================================================
// IMAGE SECTION
// ======================================================

function ImageSection({ section }) {
  if (!section.image) {
    return (
      <SectionWrapper section={section}>
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-gray-100 text-center text-sm text-gray-400">
          No image selected
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper section={section}>
      <div
        className={`overflow-hidden ${
          section.borderRadius ? "" : "rounded-3xl"
        }`}
        style={{
          borderRadius: section.borderRadius
            ? `${section.borderRadius}px`
            : undefined,
        }}
      >
        <img
          src={section.image}
          alt={section.title || "Website image"}
          className="h-auto max-h-[700px] w-full object-cover"
          loading="lazy"
        />

        {(section.title || section.description) && (
          <div className={`mt-5 ${getTextAlignClass(section.textAlign)}`}>
            {section.title && (
              <h2 className="text-2xl font-black">{section.title}</h2>
            )}

            {section.description && (
              <p className="mt-2 text-sm leading-7 opacity-70">
                {section.description}
              </p>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

// ======================================================
// SPACER
// ======================================================

function SpacerSection({ section }) {
  return (
    <div
      style={{
        height: `${safeNumber(section.settings?.height, 80)}px`,
      }}
    />
  );
}

// ======================================================
// DEAL OF THE DAY
// ======================================================

function DealOfDaySection({ section, products }) {
  const items = products.slice(0, section.limit || 4);

  return (
    <SectionWrapper section={section} className="bg-gray-950 text-white">
      <SectionHeader
        section={{
          ...section,
          textColor: "#ffffff",
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product, index) => (
          <ProductCard
            key={getProductId(product) || index}
            product={product}
            section={{
              ...section,
              showDiscount: true,
              showRating: true,
            }}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

// ======================================================
// EMPTY
// ======================================================

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-sm text-gray-400">
      {text}
    </div>
  );
}

// ======================================================
// RENDER SECTION
// ======================================================

function RenderSection({ section, products, categories }) {
  if (!section) {
    return null;
  }

  if (section.enabled === false) {
    return null;
  }

  switch (section.type) {
    case "hero":
      return <HeroSection section={section} />;

    case "trust_features":
      return <TrustFeaturesSection section={section} />;

    case "categories":
      return <CategoriesSection section={section} categories={categories} />;

    case "products":
    case "featured_products":
    case "trending_products":
    case "new_arrivals":
      return <ProductsSection section={section} products={products} />;

    case "deal_of_day":
      return <DealOfDaySection section={section} products={products} />;

    case "promo_banner":
      return <PromoBannerSection section={section} />;

    case "why_choose_us":
      return <WhyChooseUsSection section={section} />;

    case "testimonials":
      return <TestimonialsSection section={section} />;

    case "newsletter":
      return <NewsletterSection section={section} />;

    case "cta":
      return <CTASection section={section} />;

    case "text":
      return <TextSection section={section} />;

    case "image":
      return <ImageSection section={section} />;

    case "spacer":
      return <SpacerSection section={section} />;

    default:
      return <TextSection section={section} />;
  }
}

// ======================================================
// HEADER
// ======================================================

function StoreHeader({ website }) {
  const settings = website?.settings || {};

  const logo = settings.logo || website?.logo || website?.logoUrl || "";

  const storeName = website?.name || website?.businessName || "Your Store";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex min-w-0 items-center gap-3">
          {logo ? (
            <img
              src={logo}
              alt={storeName}
              className="h-9 max-w-[150px] object-contain"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-xs font-black text-white">
              {storeName.slice(0, 1).toUpperCase()}
            </div>
          )}

          <span className="truncate text-sm font-black">{storeName}</span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="/" className="text-sm font-semibold hover:opacity-60">
            Home
          </a>

          <a
            href="/products"
            className="text-sm font-semibold hover:opacity-60"
          >
            Shop
          </a>

          <a
            href="/categories"
            className="text-sm font-semibold hover:opacity-60"
          >
            Categories
          </a>

          <a href="/about" className="text-sm font-semibold hover:opacity-60">
            About
          </a>
        </nav>

        <div className="flex items-center gap-1">
          <a
            href="/wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100"
            aria-label="Wishlist"
          >
            <Heart size={18} />
          </a>

          <a
            href="/cart"
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
          </a>

          <a
            href="/account"
            className="hidden h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 sm:flex"
            aria-label="Account"
          >
            <User size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}

// ======================================================
// FOOTER
// ======================================================

function StoreFooter({ website }) {
  const storeName = website?.name || website?.businessName || "Your Store";

  return (
    <footer className="border-t bg-gray-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3 lg:px-10">
        <div>
          <div className="text-lg font-black">{storeName}</div>

          <p className="mt-3 max-w-sm text-sm leading-7 text-white/50">
            Discover products you will love with a simple and secure shopping
            experience.
          </p>
        </div>

        <div>
          <div className="text-sm font-black">Quick Links</div>

          <div className="mt-4 space-y-3 text-sm text-white/60">
            <a href="/" className="block hover:text-white">
              Home
            </a>

            <a href="/products" className="block hover:text-white">
              Shop
            </a>

            <a href="/categories" className="block hover:text-white">
              Categories
            </a>

            <a href="/contact" className="block hover:text-white">
              Contact
            </a>
          </div>
        </div>

        <div>
          <div className="text-sm font-black">Customer Care</div>

          <div className="mt-4 space-y-3 text-sm text-white/60">
            <a href="/shipping" className="block hover:text-white">
              Shipping
            </a>

            <a href="/returns" className="block hover:text-white">
              Returns
            </a>

            <a href="/privacy" className="block hover:text-white">
              Privacy Policy
            </a>

            <a href="/terms" className="block hover:text-white">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}

// ======================================================
// MAIN WEBSITE RENDERER
// ======================================================

export default function WebsiteRenderer({
  website,
  page,
  products = [],
  categories = [],
  showHeader = true,
  showFooter = true,
}) {
  const normalizedSections = useMemo(
    () => normalizeSections(page?.sections || []),
    [page?.sections],
  );

  const normalizedProducts = useMemo(
    () => normalizeArray(products),
    [products],
  );

  const normalizedCategories = useMemo(
    () => normalizeArray(categories),
    [categories],
  );

  const site = website || {};

  return (
    <div className="min-h-full w-full bg-white text-gray-900">
      {showHeader && <StoreHeader website={site} />}

      <main>
        {normalizedSections.length === 0 ? (
          <div className="flex min-h-[500px] items-center justify-center p-10">
            <EmptyState text="No sections added to this page." />
          </div>
        ) : (
          normalizedSections.map((section) => (
            <RenderSection
              key={section.id || section._id}
              section={section}
              products={normalizedProducts}
              categories={normalizedCategories}
            />
          ))
        )}
      </main>

      {showFooter && <StoreFooter website={site} />}
    </div>
  );
}
