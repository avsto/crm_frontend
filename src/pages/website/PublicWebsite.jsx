// src/pages/website/PublicWebsite.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import websiteApi from "../../api/website.api";
import categoryApi from "../../api/category.api";
import productApi from "../../api/product.api";

import WebsiteRenderer, {
  normalizeSections,
} from "../../components/website/WebsiteRenderer";

// ======================================================
// HELPERS
// ======================================================

const cleanValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizePath = (value = "") => {
  return String(value)
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
};

const getSlug = (item) => {
  if (!item) return "";

  return cleanValue(
    item.slug ||
      item.path ||
      item.url ||
      item.handle ||
      item.name
  );
};

const slugify = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-");
};

const getResponseData = (response) => {
  return response?.data ?? response;
};

const extractList = (
  response,
  keys = []
) => {
  const root = getResponseData(response);

  if (Array.isArray(root)) {
    return root;
  }

  if (Array.isArray(root?.data)) {
    return root.data;
  }

  for (const key of keys) {
    if (Array.isArray(root?.[key])) {
      return root[key];
    }
  }

  return [];
};

const extractWebsite = (response) => {
  const root = getResponseData(response);

  if (!root) {
    return null;
  }

  if (root?.website) {
    return root.website;
  }

  if (root?.data?.website) {
    return root.data.website;
  }

  if (
    root?._id ||
    root?.id ||
    root?.slug ||
    root?.name
  ) {
    return root;
  }

  if (
    root?.data &&
    typeof root.data === "object" &&
    !Array.isArray(root.data)
  ) {
    if (
      root.data._id ||
      root.data.id ||
      root.data.slug ||
      root.data.name
    ) {
      return root.data;
    }
  }

  return null;
};

const extractPages = (response) => {
  const root = getResponseData(response);

  if (!root) {
    return [];
  }

  if (Array.isArray(root)) {
    return root;
  }

  if (Array.isArray(root?.pages)) {
    return root.pages;
  }

  if (Array.isArray(root?.data?.pages)) {
    return root.data.pages;
  }

  if (Array.isArray(root?.website?.pages)) {
    return root.website.pages;
  }

  if (Array.isArray(root?.data?.website?.pages)) {
    return root.data.website.pages;
  }

  return [];
};

const getPageSlug = (page) => {
  if (!page) return "";

  return cleanValue(
    page.slug ||
      page.path ||
      page.route ||
      page.url ||
      page.handle ||
      page.name
  );
};

const isHomePage = (page) => {
  if (!page) return false;

  const slug = normalizePath(
    getPageSlug(page)
  );

  const name = cleanValue(
    page.name
  ).toLowerCase();

  return (
    page.isHome === true ||
    page.home === true ||
    page.isHomepage === true ||
    page.homepage === true ||
    slug === "" ||
    slug === "/" ||
    slug === "home" ||
    slug === "index" ||
    name === "home" ||
    name === "homepage"
  );
};

const isPublished = (page) => {
  if (!page) return false;

  if (
    page.published === false ||
    page.enabled === false ||
    page.active === false
  ) {
    return false;
  }

  if (
    page.status &&
    ["draft", "disabled", "inactive"].includes(
      String(page.status).toLowerCase()
    )
  ) {
    return false;
  }

  return true;
};

// ======================================================
// COMPONENT
// ======================================================

const PublicWebsite = () => {
  const { slug, "*": wildcardPath } =
    useParams();

  const location = useLocation();
  const navigate = useNavigate();

  // ====================================================
  // ROUTE VALUES
  // ====================================================

  const websiteSlug = useMemo(() => {
    return normalizePath(slug || "");
  }, [slug]);

  const currentPagePath = useMemo(() => {
    const fromWildcard = normalizePath(
      wildcardPath || ""
    );

    if (fromWildcard) {
      return fromWildcard;
    }

    const pathname =
      location?.pathname || "";

    const prefix = `/site/${slug || ""}`;

    let value = pathname;

    if (
      value
        .toLowerCase()
        .startsWith(prefix.toLowerCase())
    ) {
      value = value.slice(prefix.length);
    }

    return normalizePath(value);
  }, [
    wildcardPath,
    location?.pathname,
    slug,
  ]);

  const isCheckoutRoute = useMemo(() => {
    return (
      currentPagePath === "checkout" ||
      currentPagePath.startsWith(
        "checkout/"
      )
    );
  }, [currentPagePath]);

  // ====================================================
  // STATE
  // ====================================================

  const [website, setWebsite] =
    useState(null);

  const [pages, setPages] =
    useState([]);

  const [page, setPage] =
    useState(null);

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [pageLoading, setPageLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [cartCount, setCartCount] =
    useState(0);

  // ====================================================
  // WEBSITE SETTINGS
  // ====================================================

  const websiteSettings = useMemo(() => {
    return (
      website?.settings ||
      website?.theme ||
      website?.configuration ||
      {}
    );
  }, [website]);

  // ====================================================
  // CART COUNT
  // ====================================================

  const calculateCartCount = useCallback(
    (cart) => {
      if (!Array.isArray(cart)) {
        return 0;
      }

      return cart.reduce(
        (total, item) => {
          return (
            total +
            Number(
              item?.quantity ||
                item?.qty ||
                1
            )
          );
        },
        0
      );
    },
    []
  );

  const loadCartCount = useCallback(() => {
    try {
      const stored =
        localStorage.getItem("cart");

      if (!stored) {
        setCartCount(0);
        return;
      }

      const cart = JSON.parse(stored);

      if (Array.isArray(cart)) {
        setCartCount(
          calculateCartCount(cart)
        );
      } else {
        setCartCount(0);
      }
    } catch (err) {
      console.error(
        "Cart count error:",
        err
      );

      setCartCount(0);
    }
  }, [calculateCartCount]);

  useEffect(() => {
    loadCartCount();
  }, [
    loadCartCount,
    location?.pathname,
  ]);

  // ====================================================
  // CART EVENTS
  // ====================================================

  useEffect(() => {
    const handleCartUpdate = (
      event
    ) => {
      if (
        typeof event?.detail?.count ===
        "number"
      ) {
        setCartCount(
          event.detail.count
        );

        return;
      }

      loadCartCount();
    };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdate
    );

    window.addEventListener(
      "storage",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate
      );

      window.removeEventListener(
        "storage",
        handleCartUpdate
      );
    };
  }, [loadCartCount]);

  // ====================================================
  // LOAD WEBSITE BY SLUG
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadWebsite = async () => {
      if (!websiteSlug) {
        setLoading(false);
        setError(
          "Website slug is missing."
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        let response = null;

        // ----------------------------------------------
        // Preferred API
        // ----------------------------------------------

        if (
          typeof websiteApi.getPreviewWebsite ===
          "function"
        ) {
          response =
            await websiteApi.getPreviewWebsite(
              websiteSlug
            );
        }

        // ----------------------------------------------
        // Fallback API
        // ----------------------------------------------

        else if (
          typeof websiteApi.getWebsite ===
          "function"
        ) {
          response =
            await websiteApi.getWebsite(
              websiteSlug
            );
        } else {
          throw new Error(
            "Website API method is not available."
          );
        }

        if (!mounted) {
          return;
        }

        const websiteData =
          extractWebsite(response);

        if (!websiteData) {
          throw new Error(
            "Website not found."
          );
        }

        setWebsite(websiteData);

        // ----------------------------------------------
        // Pages may already be included
        // ----------------------------------------------

        const websitePages =
          extractPages(response);

        if (websitePages.length) {
          setPages(websitePages);
        } else if (
          Array.isArray(
            websiteData?.pages
          )
        ) {
          setPages(
            websiteData.pages
          );
        } else {
          setPages([]);
        }
      } catch (err) {
        console.error(
          "PublicWebsite website error:",
          err
        );

        if (!mounted) {
          return;
        }

        setWebsite(null);
        setPages([]);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load website."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadWebsite();

    return () => {
      mounted = false;
    };
  }, [websiteSlug]);

  // ====================================================
  // LOAD PRODUCTS + CATEGORIES
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadStoreData = async () => {
      if (!websiteSlug) {
        return;
      }

      try {
        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          productApi.getProducts({
            page: 1,
            limit: 100,
          }),

          categoryApi.getCategories(),
        ]);

        if (!mounted) {
          return;
        }

        const productList =
          extractList(
            productsResponse,
            ["products"]
          );

        const categoryList =
          extractList(
            categoriesResponse,
            ["categories"]
          );

        setProducts(productList);
        setCategories(categoryList);
      } catch (err) {
        console.error(
          "PublicWebsite store data error:",
          err
        );

        if (!mounted) {
          return;
        }

        setProducts([]);
        setCategories([]);
      }
    };

    loadStoreData();

    return () => {
      mounted = false;
    };
  }, [websiteSlug]);

  // ====================================================
  // LOAD PAGES IF NOT INCLUDED
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadWebsitePages = async () => {
      if (!websiteSlug || !website) {
        return;
      }

      // Already loaded
      if (pages.length > 0) {
        return;
      }

      try {
        let response = null;

        if (
          typeof websiteApi.getPages ===
          "function"
        ) {
          response =
            await websiteApi.getPages(
              website?._id ||
                website?.id ||
                websiteSlug
            );
        } else if (
          typeof websiteApi.getWebsitePages ===
          "function"
        ) {
          response =
            await websiteApi.getWebsitePages(
              website?._id ||
                website?.id ||
                websiteSlug
            );
        }

        if (!response) {
          return;
        }

        if (!mounted) {
          return;
        }

        const websitePages =
          extractPages(response);

        setPages(websitePages);
      } catch (err) {
        console.error(
          "PublicWebsite pages error:",
          err
        );
      }
    };

    loadWebsitePages();

    return () => {
      mounted = false;
    };
  }, [
    websiteSlug,
    website,
    pages.length,
  ]);

  // ====================================================
  // FIND CURRENT PAGE
  // ====================================================

  const findLocalPage = useCallback(
    (pageList) => {
      if (!Array.isArray(pageList)) {
        return null;
      }

      const cleanCurrentPath =
        normalizePath(
          currentPagePath
        );

      // ----------------------------------------------
      // HOME
      // ----------------------------------------------

      if (!cleanCurrentPath) {
        return (
          pageList.find(
            (item) =>
              isPublished(item) &&
              isHomePage(item)
          ) ||
          pageList.find(
            (item) =>
              isPublished(item) &&
              normalizePath(
                getPageSlug(item)
              ) === "home"
          ) ||
          pageList.find(
            (item) =>
              isPublished(item)
          ) ||
          null
        );
      }

      // ----------------------------------------------
      // Exact slug
      // ----------------------------------------------

      const exact = pageList.find(
        (item) => {
          if (!isPublished(item)) {
            return false;
          }

          const itemSlug =
            normalizePath(
              getPageSlug(item)
            );

          return (
            itemSlug ===
            cleanCurrentPath
          );
        }
      );

      if (exact) {
        return exact;
      }

      // ----------------------------------------------
      // Slash variants
      // ----------------------------------------------

      const slashMatch =
        pageList.find((item) => {
          if (!isPublished(item)) {
            return false;
          }

          const itemSlug =
            normalizePath(
              getPageSlug(item)
            );

          return (
            `/${itemSlug}` ===
              `/${cleanCurrentPath}` ||
            itemSlug.replace(
              /^pages\//,
              ""
            ) === cleanCurrentPath
          );
        });

      if (slashMatch) {
        return slashMatch;
      }

      // ----------------------------------------------
      // Name match
      // ----------------------------------------------

      const nameMatch =
        pageList.find((item) => {
          if (!isPublished(item)) {
            return false;
          }

          return (
            normalizePath(
              item?.name
            ) === cleanCurrentPath
          );
        });

      return nameMatch || null;
    },
    [currentPagePath]
  );

  // ====================================================
  // FIND / LOAD PAGE
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadCurrentPage = async () => {
      if (!website) {
        return;
      }

      // ------------------------------------------------
      // CHECKOUT
      // ------------------------------------------------

      if (isCheckoutRoute) {
        if (mounted) {
          setPage(null);
          setPageLoading(false);
        }

        return;
      }

      // ------------------------------------------------
      // LOCAL PAGE
      // ------------------------------------------------

      const localPage =
        findLocalPage(pages);

      if (
        localPage &&
        Array.isArray(
          localPage.sections
        )
      ) {
        if (!mounted) {
          return;
        }

        setPage({
          ...localPage,
          sections:
            normalizeSections(
              localPage.sections
            ),
        });

        return;
      }

      // ------------------------------------------------
      // PAGE ID AVAILABLE
      // ------------------------------------------------

      const pageId =
        localPage?._id ||
        localPage?.id ||
        null;

      if (
        pageId &&
        typeof websiteApi.getPage ===
          "function"
      ) {
        try {
          setPageLoading(true);

          const response =
            await websiteApi.getPage(
              website?._id ||
                website?.id,
              pageId
            );

          if (!mounted) {
            return;
          }

          const result =
            getResponseData(response);

          const fetchedPage =
            result?.page ||
            result?.data?.page ||
            result?.data ||
            result;

          if (fetchedPage) {
            setPage({
              ...fetchedPage,
              sections:
                normalizeSections(
                  fetchedPage?.sections ||
                    []
                ),
            });

            return;
          }
        } catch (err) {
          console.error(
            "Page loading error:",
            err
          );
        } finally {
          if (mounted) {
            setPageLoading(false);
          }
        }
      }

      // ------------------------------------------------
      // GET PAGE BY SLUG
      // ------------------------------------------------

      if (
        currentPagePath &&
        typeof websiteApi.getPageBySlug ===
          "function"
      ) {
        try {
          setPageLoading(true);

          const response =
            await websiteApi.getPageBySlug(
              website?._id ||
                website?.id ||
                websiteSlug,
              currentPagePath
            );

          if (!mounted) {
            return;
          }

          const result =
            getResponseData(response);

          const fetchedPage =
            result?.page ||
            result?.data?.page ||
            result?.data ||
            result;

          if (fetchedPage) {
            setPage({
              ...fetchedPage,
              sections:
                normalizeSections(
                  fetchedPage?.sections ||
                    []
                ),
            });

            return;
          }
        } catch (err) {
          console.error(
            "Page slug loading error:",
            err
          );
        } finally {
          if (mounted) {
            setPageLoading(false);
          }
        }
      }

      // ------------------------------------------------
      // NO PAGE
      // ------------------------------------------------

      if (!mounted) {
        return;
      }

      setPage(null);
      setPageLoading(false);
    };

    loadCurrentPage();

    return () => {
      mounted = false;
    };
  }, [
    website,
    pages,
    websiteSlug,
    currentPagePath,
    isCheckoutRoute,
    findLocalPage,
  ]);

  // ====================================================
  // NAVIGATION
  // ====================================================

  const handleNavigate =
    useCallback(
      (url) => {
        if (!url) {
          return;
        }

        const value =
          String(url).trim();

        if (
          !value ||
          value === "#"
        ) {
          return;
        }

        // External
        if (
          /^https?:\/\//i.test(value)
        ) {
          window.open(
            value,
            "_blank",
            "noopener,noreferrer"
          );

          return;
        }

        // Email
        if (
          /^mailto:/i.test(value)
        ) {
          window.location.href =
            value;

          return;
        }

        // Telephone
        if (
          /^tel:/i.test(value)
        ) {
          window.location.href =
            value;

          return;
        }

        // ----------------------------------------------
        // Internal website route
        // ----------------------------------------------

        let target = value;

        if (
          !target.startsWith("/")
        ) {
          target = `/${target}`;
        }

        // If renderer gives "/about"
        // convert to "/site/{slug}/about"
        if (
          target === "/" ||
          target === ""
        ) {
          navigate(
            `/site/${websiteSlug}`
          );

          return;
        }

        // Already contains /site
        if (
          target.startsWith(
            `/site/${websiteSlug}`
          )
        ) {
          navigate(target);
          return;
        }

        navigate(
          `/site/${websiteSlug}${target}`
        );
      },
      [
        navigate,
        websiteSlug,
      ]
    );

  // ====================================================
  // ADD TO CART
  // ====================================================

  const handleAddToCart =
    useCallback(
      (product) => {
        if (!product) {
          return;
        }

        try {
          const productId =
            product?._id ||
            product?.id ||
            product?.productId;

          if (!productId) {
            return;
          }

          const stored =
            localStorage.getItem(
              "cart"
            );

          let cart = [];

          try {
            const parsed = stored
              ? JSON.parse(stored)
              : [];

            if (
              Array.isArray(parsed)
            ) {
              cart = parsed;
            }
          } catch {
            cart = [];
          }

          const existingIndex =
            cart.findIndex(
              (item) => {
                const id =
                  item?._id ||
                  item?.id ||
                  item?.productId;

                return (
                  String(id) ===
                  String(productId)
                );
              }
            );

          if (
            existingIndex >= 0
          ) {
            const currentQty =
              Number(
                cart[
                  existingIndex
                ]?.quantity ||
                  cart[
                    existingIndex
                  ]?.qty ||
                  1
              );

            cart[
              existingIndex
            ] = {
              ...cart[
                existingIndex
              ],
              quantity:
                currentQty + 1,
              qty:
                currentQty + 1,
            };
          } else {
            cart.push({
              ...product,
              productId,
              quantity: 1,
              qty: 1,
            });
          }

          localStorage.setItem(
            "cart",
            JSON.stringify(cart)
          );

          const count =
            calculateCartCount(
              cart
            );

          setCartCount(count);

          window.dispatchEvent(
            new CustomEvent(
              "cartUpdated",
              {
                detail: {
                  cart,
                  count,
                  product,
                },
              }
            )
          );
        } catch (err) {
          console.error(
            "Add to cart error:",
            err
          );
        }
      },
      [calculateCartCount]
    );

  // ====================================================
  // NEWSLETTER
  // ====================================================

  const handleNewsletterSubmit =
    useCallback(async (email) => {
      console.log(
        "Newsletter:",
        email
      );

      // Add newsletter API here later.
    }, []);

  // ====================================================
  // CHECKOUT PAGE
  // ====================================================

  /*
   * IMPORTANT:
   *
   * We intentionally don't render WebsiteRenderer
   * for /checkout.
   *
   * If you already have Checkout.jsx, import it
   * here and render it.
   *
   * Example:
   *
   * import Checkout from "./Checkout";
   *
   * if (isCheckoutRoute) {
   *   return (
   *     <Checkout
   *       website={website}
   *       products={products}
   *     />
   *   );
   * }
   *
   * For now this section uses a built-in checkout
   * fallback so your route does not break.
   */

  if (
    !loading &&
    website &&
    isCheckoutRoute
  ) {
    return (
      <CheckoutFallback
        website={website}
        cartCount={cartCount}
        onNavigate={handleNavigate}
      />
    );
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />

          <p className="mt-4 text-sm text-gray-500">
            Loading store...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (
    error &&
    !website
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-xl font-bold text-red-600">
              !
            </span>
          </div>

          <h1 className="mt-5 text-xl font-semibold text-gray-900">
            Store unavailable
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // WEBSITE NOT FOUND
  // ====================================================

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Store not found
          </h1>

          <p className="mt-3 text-gray-500">
            The requested website could not
            be found.
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // PAGE NOT FOUND
  // ====================================================

  if (
    !page &&
    !pageLoading
  ) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-7xl font-bold text-gray-100">
            404
          </div>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Page not found
          </h1>

          <p className="mt-3 text-gray-500">
            This page doesn't exist in this
            website.
          </p>

          <button
            type="button"
            onClick={() =>
              handleNavigate("/")
            }
            className="mt-6 px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // PAGE LOADING
  // ====================================================

  if (
    pageLoading &&
    !page
  ) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />

          <p className="mt-4 text-sm text-gray-500">
            Loading page...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // NORMALIZE PAGE
  // ====================================================

  const normalizedPage = {
    ...page,
    sections: normalizeSections(
      page?.sections || []
    ),
  };

  // ====================================================
  // RENDER WEBSITE
  // ====================================================

  return (
    <div className="min-h-screen bg-white">
      {pageLoading && (
        <div className="fixed top-0 left-0 right-0 z-[99999] h-1 bg-gray-100">
          <div className="h-full w-1/3 bg-gray-900 animate-pulse" />
        </div>
      )}

      <WebsiteRenderer
        website={{
          ...website,
          settings:
            websiteSettings,
        }}
        page={normalizedPage}
        products={products}
        categories={categories}
        cartCount={cartCount}
        onAddToCart={
          handleAddToCart
        }
        onNavigate={
          handleNavigate
        }
        onNewsletterSubmit={
          handleNewsletterSubmit
        }
        showHeader={true}
        showFooter={true}
      />
    </div>
  );
};

// ======================================================
// CHECKOUT FALLBACK
// ======================================================

const CheckoutFallback = ({
  website,
  cartCount,
  onNavigate,
}) => {
  const [cart, setCart] =
    useState([]);

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          "cart"
        );

      if (!stored) {
        setCart([]);
        return;
      }

      const parsed =
        JSON.parse(stored);

      setCart(
        Array.isArray(parsed)
          ? parsed
          : []
      );
    } catch {
      setCart([]);
    }
  }, []);

  const updateQuantity = (
    index,
    quantity
  ) => {
    const nextQuantity =
      Math.max(
        1,
        Number(quantity || 1)
      );

    const updated = [...cart];

    updated[index] = {
      ...updated[index],
      quantity: nextQuantity,
      qty: nextQuantity,
    };

    setCart(updated);

    localStorage.setItem(
      "cart",
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new CustomEvent(
        "cartUpdated",
        {
          detail: {
            cart: updated,
          },
        }
      )
    );
  };

  const removeItem = (index) => {
    const updated =
      cart.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

    setCart(updated);

    localStorage.setItem(
      "cart",
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new CustomEvent(
        "cartUpdated",
        {
          detail: {
            cart: updated,
          },
        }
      )
    );
  };

  const getImage = (item) => {
    if (!item) {
      return "";
    }

    if (
      typeof item.image ===
      "string"
    ) {
      return item.image;
    }

    if (
      typeof item.featuredImage ===
      "string"
    ) {
      return item.featuredImage;
    }

    if (
      typeof item.thumbnail ===
      "string"
    ) {
      return item.thumbnail;
    }

    if (
      Array.isArray(
        item.images
      )
    ) {
      const first =
        item.images[0];

      if (
        typeof first ===
        "string"
      ) {
        return first;
      }

      if (first?.url) {
        return first.url;
      }
    }

    return "";
  };

  const getPrice = (item) => {
    const price =
      item?.salePrice ??
      item?.sellingPrice ??
      item?.price ??
      0;

    return Number(price) || 0;
  };

  const total = cart.reduce(
    (sum, item) => {
      return (
        sum +
        getPrice(item) *
          Number(
            item?.quantity ||
              item?.qty ||
              1
          )
      );
    },
    0
  );

  const currency =
    website?.settings
      ?.currency ||
    website?.currency ||
    "INR";

  const formatPrice = (
    value
  ) => {
    try {
      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }
      ).format(value);
    } catch {
      return `₹${Number(
        value || 0
      ).toFixed(2)}`;
    }
  };

  const storeName =
    website?.name ||
    website?.settings
      ?.storeName ||
    "Store";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              onNavigate("/")
            }
            className="text-lg font-bold text-gray-900"
          >
            {storeName}
          </button>

          <div className="text-sm text-gray-500">
            {cartCount} item
            {cartCount === 1
              ? ""
              : "s"}
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART */}

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">
                  Checkout
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Review your order before
                  continuing.
                </p>
              </div>

              {cart.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-gray-500">
                    Your cart is empty.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate(
                        "/products"
                      )
                    }
                    className="mt-5 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cart.map(
                    (
                      item,
                      index
                    ) => {
                      const image =
                        getImage(
                          item
                        );

                      const price =
                        getPrice(
                          item
                        );

                      const quantity =
                        Number(
                          item?.quantity ||
                            item?.qty ||
                            1
                        );

                      return (
                        <div
                          key={
                            item?.productId ||
                            item?._id ||
                            item?.id ||
                            index
                          }
                          className="p-5 flex gap-4"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            {image ? (
                              <img
                                src={image}
                                alt={
                                  item?.name ||
                                  "Product"
                                }
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h2 className="font-medium text-gray-900">
                              {item?.name ||
                                "Product"}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                              {formatPrice(
                                price
                              )}
                            </p>

                            <div className="mt-3 flex items-center gap-3">
                              <input
                                type="number"
                                min="1"
                                value={
                                  quantity
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateQuantity(
                                    index,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="w-20 h-9 border border-gray-300 rounded-lg px-2 text-sm"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    index
                                  )
                                }
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="text-right font-semibold text-gray-900">
                            {formatPrice(
                              price *
                                quantity
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY */}

          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatPrice(
                      total
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-medium text-gray-900">
                    Free
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="font-semibold text-gray-900">
                    Total
                  </span>

                  <span className="font-bold text-gray-900">
                    {formatPrice(
                      total
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  cart.length === 0
                }
                className="mt-6 w-full h-12 rounded-xl bg-gray-900 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition"
              >
                Continue to Payment
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    "/products"
                  )
                }
                className="mt-3 w-full h-11 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicWebsite;