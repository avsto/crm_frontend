// src/pages/website/EditPage.jsx

import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Image as ImageIcon,
  Monitor,
  Palette,
  Plus,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  X,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import websiteApi from "../../api/website.api";
import categoryApi from "../../api/category.api";
import productApi from "../../api/product.api";

import WebsiteRenderer, {
  normalizeSections,
} from "../../components/website/WebsiteRenderer";

import MediaManager from "../../components/media/MediaManager";

// ======================================================
// SECTION TYPES
// ======================================================

const TYPES = [
  ["hero", "Hero", "Large introduction section"],
  ["trust_features", "Trust Features", "Shipping, support and trust points"],
  ["categories", "Categories", "Shop by category"],
  ["products", "Products", "Product grid"],
  ["featured_products", "Featured Products", "Featured collection"],
  ["trending_products", "Trending Products", "Trending collection"],
  ["new_arrivals", "New Arrivals", "Latest products"],
  ["deal_of_day", "Deal of the Day", "Special deal"],
  ["promo_banner", "Promo Banner", "Promotional banner"],
  ["why_choose_us", "Why Choose Us", "Business benefits"],
  ["testimonials", "Testimonials", "Customer reviews"],
  ["newsletter", "Newsletter", "Email capture"],
  ["cta", "Call To Action", "Conversion section"],
  ["text", "Text", "Text content"],
  ["image", "Image", "Image section"],
  ["spacer", "Spacer", "Empty space"],
];

// ======================================================
// HELPERS
// ======================================================

const uid = (type = "section") =>
  `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const listOf = (response) => {
  const body = response?.data ?? response;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.products)) return body.products;
  if (Array.isArray(body?.categories)) return body.categories;

  return [];
};

const PRODUCT_TYPES = [
  "products",
  "featured_products",
  "trending_products",
  "new_arrivals",
  "deal_of_day",
];

const IMAGE_TYPES = [
  "hero",
  "promo_banner",
  "image",
  "why_choose_us",
  "cta",
  "newsletter",
];

const getSectionLabel = (type) =>
  TYPES.find((item) => item[0] === type)?.[1] || type;

const getSectionDescription = (type) =>
  TYPES.find((item) => item[0] === type)?.[2] || "";

// ======================================================
// DEFAULT SECTION
// ======================================================

function makeSection(type, index) {
  const product = PRODUCT_TYPES.includes(type);

  const section = {
    id: uid(type),
    type,
    enabled: true,
    sortOrder: index + 1,

    layout: product ? "grid" : "default",

    badge: "",
    title: "",
    highlight: "",
    subtitle: "",
    description: "",

    image: "",
    background: "",

    limit: product ? 8 : 8,

    source: product ? "api" : "manual",

    showPrice: true,
    showRating: false,
    showAddToCart: true,
    showCountdown: false,
    showDiscount: false,

    placeholder: "",
    discount: "",

    textAlign: "left",
    contentWidth: "medium",

    backgroundColor: "",
    textColor: "",
    accentColor: "",

    overlay: false,
    overlayOpacity: 40,

    paddingTop: 64,
    paddingBottom: 64,

    borderRadius: 0,

    button: {
      label: "",
      url: "",
      action: "",
    },

    secondaryButton: {
      label: "",
      url: "",
      action: "",
    },

    items: [],

    settings: {},
  };

  // ----------------------------------------------------
  // HERO
  // ----------------------------------------------------

  if (type === "hero") {
    Object.assign(section, {
      badge: "New Collection",
      title: "Discover Something Beautiful",
      subtitle: "",
      description:
        "Explore our latest collection and find products made for you.",

      button: {
        label: "Shop Collection",
        url: "/products",
        action: "",
      },

      secondaryButton: {
        label: "Explore Categories",
        url: "/categories",
        action: "",
      },

      textAlign: "left",
      contentWidth: "large",

      overlay: true,
      overlayOpacity: 35,

      paddingTop: 80,
      paddingBottom: 80,
    });
  }

  // ----------------------------------------------------
  // TRUST
  // ----------------------------------------------------

  if (type === "trust_features") {
    Object.assign(section, {
      title: "Why Shop With Us?",
      description:
        "Everything you need for a safe and easy shopping experience.",

      items: [
        {
          id: uid("trust"),
          title: "Free Shipping",
          description: "Free shipping on selected orders.",
          icon: "truck",
        },
        {
          id: uid("trust"),
          title: "Secure Payment",
          description: "100% secure and protected checkout.",
          icon: "shield",
        },
        {
          id: uid("trust"),
          title: "Easy Returns",
          description: "Simple and hassle-free returns.",
          icon: "return",
        },
      ],
    });
  }

  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------

  if (type === "categories") {
    Object.assign(section, {
      title: "Shop by Category",
      description: "Explore our most popular categories.",
      limit: 8,
      layout: "grid",
    });
  }

  // ----------------------------------------------------
  // PRODUCTS
  // ----------------------------------------------------

  if (product) {
    let title = "Featured Products";

    if (type === "new_arrivals") {
      title = "New Arrivals";
    }

    if (type === "trending_products") {
      title = "Trending Products";
    }

    if (type === "deal_of_day") {
      title = "Deal of the Day";
    }

    Object.assign(section, {
      title,
      description: "Explore our collection.",
      limit: 8,
      layout: "grid",
      showPrice: true,
      showRating: true,
      showAddToCart: true,
    });
  }

  // ----------------------------------------------------
  // PROMO
  // ----------------------------------------------------

  if (type === "promo_banner") {
    Object.assign(section, {
      badge: "Limited Time",
      title: "Special Offer",
      description: "Get amazing products at special prices.",

      button: {
        label: "Shop Now",
        url: "/products",
        action: "",
      },

      overlay: true,
      overlayOpacity: 35,
    });
  }

  // ----------------------------------------------------
  // WHY CHOOSE US
  // ----------------------------------------------------

  if (type === "why_choose_us") {
    Object.assign(section, {
      title: "Why Choose Us",
      description:
        "We focus on quality products, reliable service and an excellent shopping experience.",
    });
  }

  // ----------------------------------------------------
  // TESTIMONIALS
  // ----------------------------------------------------

  if (type === "testimonials") {
    Object.assign(section, {
      title: "What Our Customers Say",
      description: "Real experiences from our customers.",
    });
  }

  // ----------------------------------------------------
  // NEWSLETTER
  // ----------------------------------------------------

  if (type === "newsletter") {
    Object.assign(section, {
      title: "Stay in the Loop",
      description: "Subscribe for new products, offers and updates.",
      placeholder: "Enter your email",
    });
  }

  // ----------------------------------------------------
  // CTA
  // ----------------------------------------------------

  if (type === "cta") {
    Object.assign(section, {
      title: "Ready to Shop?",
      description:
        "Explore our collection and discover something you will love.",

      button: {
        label: "Shop Now",
        url: "/products",
        action: "",
      },
    });
  }

  // ----------------------------------------------------
  // TEXT
  // ----------------------------------------------------

  if (type === "text") {
    Object.assign(section, {
      title: "About Us",
      description: "Write your content here.",
      textAlign: "left",
      contentWidth: "medium",
    });
  }

  // ----------------------------------------------------
  // IMAGE
  // ----------------------------------------------------

  if (type === "image") {
    Object.assign(section, {
      title: "",
      description: "",
      image: "",
      textAlign: "center",
    });
  }

  // ----------------------------------------------------
  // SPACER
  // ----------------------------------------------------

  if (type === "spacer") {
    section.settings = {
      height: 80,
    };
  }

  return section;
}

// ======================================================
// BASIC FIELD
// ======================================================

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  min,
  max,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-gray-700">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

// ======================================================
// TEXTAREA
// ======================================================

function Textarea({ label, value, onChange, placeholder = "", rows = 4 }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-gray-700">
        {label}
      </span>

      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

// ======================================================
// SELECT
// ======================================================

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-gray-700">
        {label}
      </span>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ======================================================
// TOGGLE
// ======================================================

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
      <span className="text-xs font-bold text-gray-700">{label}</span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

// ======================================================
// IMAGE PICKER
// ======================================================

function ImagePicker({ label = "Image", value, onSelect, onRemove }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-700">{label}</span>

        {value && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[10px] font-bold text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      {value ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <div className="relative">
            <img
              src={value}
              alt=""
              className="h-36 w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <button
              type="button"
              onClick={onSelect}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-bold shadow-lg"
            >
              <ImageIcon size={13} />
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <ImageIcon size={18} />
          </div>

          <span className="text-xs font-bold">Select Image</span>

          <span className="text-[10px]">Choose from Media Manager</span>
        </button>
      )}
    </div>
  );
}

// ======================================================
// COLLAPSIBLE SETTINGS GROUP
// ======================================================

function SettingsGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-3"
      >
        <span className="text-xs font-black text-gray-800">{title}</span>

        {open ? (
          <ChevronDown size={15} className="text-gray-400" />
        ) : (
          <ChevronRight size={15} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="space-y-4 border-t border-gray-100 p-3">{children}</div>
      )}
    </div>
  );
}

// ======================================================
// BUTTON SETTINGS
// ======================================================

function ButtonSettings({ label, button, onChange }) {
  const value = button || {};

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-3">
      <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">
        {label}
      </div>

      <Field
        label="Label"
        value={value.label}
        placeholder="Shop Now"
        onChange={(v) =>
          onChange({
            ...value,
            label: v,
          })
        }
      />

      <Field
        label="URL"
        value={value.url}
        placeholder="/products"
        onChange={(v) =>
          onChange({
            ...value,
            url: v,
          })
        }
      />

      <SelectField
        label="Action"
        value={value.action || ""}
        onChange={(v) =>
          onChange({
            ...value,
            action: v,
          })
        }
        options={[
          {
            value: "",
            label: "Default",
          },
          {
            value: "link",
            label: "Open Link",
          },
          {
            value: "products",
            label: "Products",
          },
          {
            value: "categories",
            label: "Categories",
          },
          {
            value: "checkout",
            label: "Checkout",
          },
        ]}
      />
    </div>
  );
}

// ======================================================
// SETTINGS PANEL
// ======================================================

function Settings({ s, onChange, onOpenMedia }) {
  if (!s) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
          <Palette size={20} className="text-gray-400" />
        </div>

        <div className="text-xs font-bold text-gray-700">Select a section</div>

        <div className="mt-1 text-[11px] text-gray-400">
          Select any section from the page to edit it.
        </div>
      </div>
    );
  }

  const set = (key, value) => {
    onChange({
      ...s,
      [key]: value,
    });
  };

  const setSettings = (key, value) => {
    onChange({
      ...s,
      settings: {
        ...(s.settings || {}),
        [key]: value,
      },
    });
  };

  const imageSupported = IMAGE_TYPES.includes(s.type);

  const backgroundSupported = [
    "hero",
    "promo_banner",
    "why_choose_us",
    "cta",
    "newsletter",
    "image",
  ].includes(s.type);

  return (
    <div className="space-y-4 p-3">
      {/* ------------------------------------------------ */}
      {/* BASIC */}
      {/* ------------------------------------------------ */}

      <SettingsGroup title="Content">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Section
          </div>

          <div className="mt-1 text-base font-black">
            {getSectionLabel(s.type)}
          </div>

          <div className="mt-1 text-[11px] text-gray-400">
            {getSectionDescription(s.type)}
          </div>
        </div>

        <Field
          label="Badge"
          value={s.badge}
          placeholder="New Collection"
          onChange={(v) => set("badge", v)}
        />

        <Field
          label="Title"
          value={s.title}
          placeholder="Section title"
          onChange={(v) => set("title", v)}
        />

        <Field
          label="Highlight"
          value={s.highlight}
          placeholder="Highlighted text"
          onChange={(v) => set("highlight", v)}
        />

        <Field
          label="Subtitle"
          value={s.subtitle}
          placeholder="Small subtitle"
          onChange={(v) => set("subtitle", v)}
        />

        <Textarea
          label="Description"
          value={s.description}
          placeholder="Write your section description..."
          onChange={(v) => set("description", v)}
        />

        {s.type === "newsletter" && (
          <Field
            label="Input Placeholder"
            value={s.placeholder}
            placeholder="Enter your email"
            onChange={(v) => set("placeholder", v)}
          />
        )}
      </SettingsGroup>

      {/* ------------------------------------------------ */}
      {/* IMAGES */}
      {/* ------------------------------------------------ */}

      {(imageSupported || backgroundSupported) && (
        <SettingsGroup title="Images">
          {imageSupported && (
            <ImagePicker
              label="Section Image"
              value={s.image}
              onSelect={() =>
                onOpenMedia({
                  type: "image",
                })
              }
              onRemove={() => set("image", "")}
            />
          )}

          {backgroundSupported && (
            <ImagePicker
              label="Background Image"
              value={s.background}
              onSelect={() =>
                onOpenMedia({
                  type: "background",
                })
              }
              onRemove={() => set("background", "")}
            />
          )}

          {backgroundSupported && (
            <>
              <Toggle
                label="Image Overlay"
                checked={s.overlay === true}
                onChange={(v) => set("overlay", v)}
              />

              {s.overlay && (
                <Field
                  label="Overlay Opacity"
                  type="number"
                  min="0"
                  max="100"
                  value={s.overlayOpacity ?? 40}
                  onChange={(v) =>
                    set(
                      "overlayOpacity",
                      Math.max(0, Math.min(100, Number(v) || 0)),
                    )
                  }
                />
              )}
            </>
          )}
        </SettingsGroup>
      )}

      {/* ------------------------------------------------ */}
      {/* PRODUCTS */}
      {/* ------------------------------------------------ */}

      {(PRODUCT_TYPES.includes(s.type) || s.type === "categories") && (
        <SettingsGroup title="Collection">
          <SelectField
            label="Layout"
            value={s.layout || "grid"}
            onChange={(v) => set("layout", v)}
            options={[
              {
                value: "grid",
                label: "Grid",
              },
              {
                value: "list",
                label: "List",
              },
              {
                value: "carousel",
                label: "Carousel",
              },
              {
                value: "default",
                label: "Default",
              },
            ]}
          />

          <Field
            label="Limit"
            type="number"
            min="1"
            max="100"
            value={s.limit}
            onChange={(v) => set("limit", Math.max(1, Number(v) || 1))}
          />

          {PRODUCT_TYPES.includes(s.type) && (
            <>
              <Toggle
                label="Show Price"
                checked={s.showPrice !== false}
                onChange={(v) => set("showPrice", v)}
              />

              <Toggle
                label="Show Rating"
                checked={s.showRating === true}
                onChange={(v) => set("showRating", v)}
              />

              <Toggle
                label="Show Add To Cart"
                checked={s.showAddToCart !== false}
                onChange={(v) => set("showAddToCart", v)}
              />

              <Toggle
                label="Show Discount"
                checked={s.showDiscount === true}
                onChange={(v) => set("showDiscount", v)}
              />

              <Toggle
                label="Show Countdown"
                checked={s.showCountdown === true}
                onChange={(v) => set("showCountdown", v)}
              />
            </>
          )}
        </SettingsGroup>
      )}

      {/* ------------------------------------------------ */}
      {/* BUTTONS */}
      {/* ------------------------------------------------ */}

      {["hero", "promo_banner", "cta"].includes(s.type) && (
        <SettingsGroup title="Buttons">
          <ButtonSettings
            label="Primary Button"
            button={s.button}
            onChange={(v) => set("button", v)}
          />

          {s.type === "hero" && (
            <ButtonSettings
              label="Secondary Button"
              button={s.secondaryButton}
              onChange={(v) => set("secondaryButton", v)}
            />
          )}
        </SettingsGroup>
      )}

      {/* ------------------------------------------------ */}
      {/* DESIGN */}
      {/* ------------------------------------------------ */}

      <SettingsGroup title="Design">
        <SelectField
          label="Text Alignment"
          value={s.textAlign || "left"}
          onChange={(v) => set("textAlign", v)}
          options={[
            {
              value: "left",
              label: "Left",
            },
            {
              value: "center",
              label: "Center",
            },
            {
              value: "right",
              label: "Right",
            },
          ]}
        />

        <SelectField
          label="Content Width"
          value={s.contentWidth || "medium"}
          onChange={(v) => set("contentWidth", v)}
          options={[
            {
              value: "small",
              label: "Small",
            },
            {
              value: "medium",
              label: "Medium",
            },
            {
              value: "large",
              label: "Large",
            },
            {
              value: "full",
              label: "Full Width",
            },
          ]}
        />

        <Field
          label="Background Color"
          value={s.backgroundColor}
          placeholder="#ffffff"
          onChange={(v) => set("backgroundColor", v)}
        />

        <Field
          label="Text Color"
          value={s.textColor}
          placeholder="#111111"
          onChange={(v) => set("textColor", v)}
        />

        <Field
          label="Accent Color"
          value={s.accentColor}
          placeholder="#2563eb"
          onChange={(v) => set("accentColor", v)}
        />

        <Field
          label="Border Radius"
          type="number"
          min="0"
          max="100"
          value={s.borderRadius ?? 0}
          onChange={(v) => set("borderRadius", Math.max(0, Number(v) || 0))}
        />
      </SettingsGroup>

      {/* ------------------------------------------------ */}
      {/* SPACING */}
      {/* ------------------------------------------------ */}

      <SettingsGroup title="Spacing">
        {s.type === "spacer" ? (
          <Field
            label="Spacer Height"
            type="number"
            min="0"
            max="500"
            value={s.settings?.height || 80}
            onChange={(v) => setSettings("height", Math.max(0, Number(v) || 0))}
          />
        ) : (
          <>
            <Field
              label="Top Padding"
              type="number"
              min="0"
              max="300"
              value={s.paddingTop ?? 64}
              onChange={(v) => set("paddingTop", Math.max(0, Number(v) || 0))}
            />

            <Field
              label="Bottom Padding"
              type="number"
              min="0"
              max="300"
              value={s.paddingBottom ?? 64}
              onChange={(v) =>
                set("paddingBottom", Math.max(0, Number(v) || 0))
              }
            />
          </>
        )}
      </SettingsGroup>

      {/* ------------------------------------------------ */}
      {/* VISIBILITY */}
      {/* ------------------------------------------------ */}

      <SettingsGroup title="Visibility">
        <Toggle
          label="Visible"
          checked={s.enabled !== false}
          onChange={(v) => set("enabled", v)}
        />
      </SettingsGroup>
    </div>
  );
}

// ======================================================
// ADD SECTION MODAL
// ======================================================

function AddModal({ open, onClose, onAdd }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black">Add Section</h2>

            <p className="mt-1 text-xs text-gray-500">
              Build your website using reusable sections.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map(([value, label, description]) => (
            <button
              key={value}
              type="button"
              onClick={() => onAdd(value)}
              className="rounded-2xl border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-black">
                  {label.slice(0, 1)}
                </div>

                <div>
                  <div className="text-sm font-bold">{label}</div>

                  <div className="mt-1 text-xs leading-5 text-gray-500">
                    {description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MAIN EDIT PAGE
// ======================================================

export default function EditPage() {
  const { websiteId, pageId } = useParams();

  const nav = useNavigate();

  // ----------------------------------------------------
  // DATA
  // ----------------------------------------------------

  const [page, setPage] = useState(null);
  const [website, setWebsite] = useState(null);

  const [sections, setSections] = useState([]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------

  const [selected, setSelected] = useState(null);
  const [device, setDevice] = useState("desktop");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(false);

  // ----------------------------------------------------
  // MEDIA MANAGER
  // ----------------------------------------------------

  const [mediaOpen, setMediaOpen] = useState(false);

  const [mediaTarget, setMediaTarget] = useState(null);

  // ====================================================
  // LOAD PAGE
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await websiteApi.getPage(websiteId, pageId);

        const result = response?.data ?? response;

        if (result?.success === false) {
          throw new Error(result?.message || "Unable to load page");
        }

        const loadedPage = result?.data?.page || result?.data || result;

        if (!mounted) return;

        setPage(loadedPage);

        setWebsite(loadedPage?.website || loadedPage?.websiteData || {});

        const normalized = normalizeSections(loadedPage?.sections || []);

        setSections(
          normalized.map((section, index) => ({
            ...makeSection(section?.type || "text", index),
            ...section,
          })),
        );

        const [productResponse, categoryResponse] = await Promise.all([
          productApi.getProducts({
            page: 1,
            limit: 100,
          }),

          categoryApi.getCategories(),
        ]);

        if (!mounted) return;

        setProducts(listOf(productResponse));

        setCategories(listOf(categoryResponse));
      } catch (e) {
        if (!mounted) return;

        setError(
          e?.response?.data?.message || e?.message || "Unable to load page",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [websiteId, pageId]);

  // ====================================================
  // UPDATE SECTION
  // ====================================================

  const update = (index) => (value) => {
    setSections((current) =>
      current.map((section, i) => (i === index ? value : section)),
    );

    setSaved(false);
    setError("");
  };

  // ====================================================
  // OPEN MEDIA MANAGER
  // ====================================================

  const openMedia = (target) => {
    setMediaTarget(target);
    setMediaOpen(true);
  };

  // ====================================================
  // MEDIA SELECT
  // ====================================================

  const handleMediaSelect = (file) => {
    if (!file?.url) return;

    if (!mediaTarget || selected === null) {
      setMediaOpen(false);
      setMediaTarget(null);
      return;
    }

    const sectionIndex = selected;

    setSections((current) =>
      current.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        if (mediaTarget.type === "background") {
          return {
            ...section,
            background: file.url,
          };
        }

        return {
          ...section,
          image: file.url,
        };
      }),
    );

    setSaved(false);

    // Important:
    // MediaManager ko parent side se bhi close kar rahe hain.
    // Isse MediaManager internally close kare ya na kare,
    // dono cases mein modal close ho jayega.
    setMediaOpen(false);
    setMediaTarget(null);
  };

  // ====================================================
  // MOVE SECTION
  // ====================================================

  const move = (index, direction) => {
    setSections((current) => {
      const next = [...current];

      const target = index + direction;

      if (target < 0 || target >= next.length) {
        return current;
      }

      [next[index], next[target]] = [next[target], next[index]];

      return next.map((section, i) => ({
        ...section,
        sortOrder: i + 1,
      }));
    });

    setSaved(false);
  };

  // ====================================================
  // DUPLICATE
  // ====================================================

  const duplicate = (index) => {
    setSections((current) => {
      const copy = JSON.parse(JSON.stringify(current[index]));

      delete copy._id;

      copy.id = uid(copy.type || "section");

      return [
        ...current.slice(0, index + 1),
        copy,
        ...current.slice(index + 1),
      ].map((section, i) => ({
        ...section,
        sortOrder: i + 1,
      }));
    });

    setSelected(index + 1);
    setSaved(false);
  };

  // ====================================================
  // REMOVE
  // ====================================================

  const remove = (index) => {
    if (!window.confirm("Delete this section?")) {
      return;
    }

    setSections((current) =>
      current
        .filter((_, i) => i !== index)
        .map((section, i) => ({
          ...section,
          sortOrder: i + 1,
        })),
    );

    setSelected(null);
    setSaved(false);
  };

  // ====================================================
  // ADD
  // ====================================================

  const add = (type) => {
    setSections((current) => {
      const next = [...current, makeSection(type, current.length)];

      return next.map((section, index) => ({
        ...section,
        sortOrder: index + 1,
      }));
    });

    setSelected(sections.length);
    setModal(false);
    setSaved(false);
  };

  // ====================================================
  // SAVE
  // ====================================================

  const save = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        name: page?.name || "",

        slug: page?.slug || "/",

        title: page?.title || "",

        status: page?.status || "draft",

        sortOrder: Number(page?.sortOrder) || 0,

        sections: sections.map((section, index) => {
          const copy = {
            ...section,
            sortOrder: index + 1,
          };

          delete copy._id;

          return copy;
        }),
      };

      const response = await websiteApi.updatePage(websiteId, pageId, payload);

      const result = response?.data ?? response;

      if (result?.success === false) {
        throw new Error(result?.message || "Unable to save");
      }

      const updatedPage = result?.data?.page || result?.data;

      if (updatedPage) {
        setPage(updatedPage);

        const normalized = normalizeSections(updatedPage.sections || []);

        setSections(
          normalized.map((section, index) => ({
            ...makeSection(section?.type || "text", index),
            ...section,
          })),
        );
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // CURRENT SECTION
  // ====================================================

  const current = selected === null ? null : sections[selected];

  // ====================================================
  // PREVIEW WEBSITE
  // ====================================================

  const previewWebsite = useMemo(
    () => ({
      ...(website || {}),
      name: website?.name || "Your Store",

      settings: {
        ...(website?.settings || {}),
      },
    }),
    [website],
  );

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef1f5] text-sm text-gray-600">
        Loading page builder...
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error && !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef1f5] p-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
          <b className="text-sm">Unable to load page</b>

          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef1f5]">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="flex h-[68px] shrink-0 items-center justify-between border-b bg-white px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => nav(`/website/${websiteId}`)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <b className="truncate text-sm sm:text-base">
                {page?.title || page?.name || "Page Builder"}
              </b>

              <span className="hidden rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 sm:inline">
                Visual Builder
              </span>
            </div>

            <div className="truncate text-[11px] text-gray-400">
              /{page?.slug || ""}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* DEVICE */}

          <div className="hidden rounded-xl border bg-gray-50 p-1 sm:flex">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                device === "desktop" ? "bg-white shadow" : "text-gray-400"
              }`}
            >
              <Monitor size={16} />
            </button>

            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                device === "tablet" ? "bg-white shadow" : "text-gray-400"
              }`}
            >
              <Tablet size={16} />
            </button>

            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                device === "mobile" ? "bg-white shadow" : "text-gray-400"
              }`}
            >
              <Smartphone size={16} />
            </button>
          </div>

          {saved && (
            <span className="hidden text-xs font-bold text-green-600 sm:block">
              Saved
            </span>
          )}

          <button
            type="button"
            onClick={() => nav(`/website/${websiteId}/page/${pageId}/preview`)}
            className="flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold"
          >
            <Eye size={16} />

            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="flex h-10 items-center gap-2 rounded-xl bg-gray-950 px-4 text-xs font-bold text-white disabled:opacity-60"
          >
            <Save size={16} />

            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="absolute right-5 top-[78px] z-[120] max-w-sm rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 shadow-lg">
          {error}
        </div>
      )}

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="flex min-h-0 flex-1">
        {/* ==================================================
            LEFT SIDEBAR
        ================================================== */}

        <aside className="hidden w-[260px] shrink-0 overflow-y-auto border-r bg-white xl:block">
          <div className="border-b px-4 py-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Page Structure
            </div>

            <b className="text-sm">Sections</b>
          </div>

          <div className="p-3">
            {sections.length === 0 && (
              <div className="rounded-xl border border-dashed p-5 text-center">
                <div className="text-xs font-bold text-gray-600">
                  No sections
                </div>

                <div className="mt-1 text-[10px] text-gray-400">
                  Add your first section.
                </div>
              </div>
            )}

            {sections.map((section, index) => (
              <button
                key={section.id || section._id || index}
                type="button"
                onClick={() => setSelected(index)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                  selected === index
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-black">
                  {getSectionLabel(section.type).slice(0, 1).toUpperCase()}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold">
                    {getSectionLabel(section.type)}
                  </span>

                  {section.title && (
                    <span className="mt-0.5 block truncate text-[10px] text-gray-400">
                      {section.title}
                    </span>
                  )}
                </span>

                {section.enabled === false && (
                  <span className="text-[9px] text-gray-400">Hidden</span>
                )}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setModal(true)}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed text-xs font-bold transition hover:border-blue-400 hover:bg-blue-50"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>
        </aside>

        {/* ==================================================
            CENTER PREVIEW
        ================================================== */}

        <main className="min-w-0 flex-1 overflow-auto p-3 pb-28 md:p-6 md:pb-28">
          <div
            className={`mx-auto h-fit overflow-hidden bg-white shadow-2xl transition-all ${
              device === "mobile"
                ? "w-[390px] max-w-full rounded-[30px] border-8 border-gray-900"
                : device === "tablet"
                  ? "w-[768px] max-w-full rounded-2xl"
                  : "w-full max-w-[1280px] rounded-xl"
            }`}
          >
            <WebsiteRenderer
              website={previewWebsite}
              page={{
                ...page,
                sections,
              }}
              products={products}
              categories={categories}
              showFooter={false}
            />
          </div>
        </main>

        {/* ==================================================
            RIGHT SETTINGS
        ================================================== */}

        <aside className="hidden w-[330px] shrink-0 overflow-y-auto border-l bg-white lg:block">
          <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-4">
            <div>
              <b className="text-sm">Section Settings</b>

              {current && (
                <div className="text-[10px] text-gray-400">
                  {getSectionLabel(current.type)}
                </div>
              )}
            </div>

            {current && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Settings
            s={current}
            onChange={update(selected ?? 0)}
            onOpenMedia={openMedia}
          />
        </aside>
      </div>

      {/* ==================================================
          FLOATING TOOLBAR
      ================================================== */}

      <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gray-950 p-2 shadow-2xl">
        <button
          type="button"
          onClick={() => setModal(true)}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add</span>
        </button>

        {selected !== null && (
          <>
            <button
              type="button"
              onClick={() => move(selected, -1)}
              title="Move Up"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <ArrowUp size={15} />
            </button>

            <button
              type="button"
              onClick={() => move(selected, 1)}
              title="Move Down"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <ArrowDown size={15} />
            </button>

            <button
              type="button"
              onClick={() => duplicate(selected)}
              title="Duplicate"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <Copy size={15} />
            </button>

            <button
              type="button"
              onClick={() => remove(selected)}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-red-500/30"
            >
              <Trash2 size={15} />
            </button>

            <button
              type="button"
              onClick={() => setSelected(null)}
              title="Done"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <Check size={15} />
            </button>
          </>
        )}
      </div>

      {/* ==================================================
          ADD MODAL
      ================================================== */}

      <AddModal open={modal} onClose={() => setModal(false)} onAdd={add} />

      {/* ==================================================
          MEDIA MANAGER
      ================================================== */}

      <MediaManager
        open={mediaOpen}
        onClose={() => {
          setMediaOpen(false);
          setMediaTarget(null);
        }}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
