import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import productApi from "../../api/product.api";

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);

  const [selectedStoreId, setSelectedStoreId] = useState(
    localStorage.getItem("selectedStoreId") ||
      localStorage.getItem("activeStoreId") ||
      localStorage.getItem("storeId") ||
      "",
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD STORES
  // ============================================================

  const loadStores = async () => {
    try {
      setLoadingStores(true);

      const storedStores = JSON.parse(localStorage.getItem("stores") || "[]");

      if (Array.isArray(storedStores) && storedStores.length > 0) {
        setStores(storedStores);

        if (!selectedStoreId) {
          const firstId = storedStores[0]?._id || storedStores[0]?.id || "";

          setSelectedStoreId(firstId);

          if (firstId) {
            localStorage.setItem("selectedStoreId", firstId);

            localStorage.setItem("activeStoreId", firstId);
          }
        }
      }
    } catch (err) {
      console.error("STORE LOAD ERROR:", err);
    } finally {
      setLoadingStores(false);
    }
  };

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await productApi.getProducts({
        storeId: selectedStoreId || undefined,
      });

      const data =
        response?.data?.data ||
        response?.data?.products ||
        response?.data ||
        [];

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("PRODUCT LOAD ERROR:", err);

      setError(err?.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedStoreId]);

  // ============================================================
  // STORE CHANGE
  // ============================================================

  const handleStoreChange = (storeId) => {
    setSelectedStoreId(storeId);

    localStorage.setItem("selectedStoreId", storeId);

    localStorage.setItem("activeStoreId", storeId);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (product) => {
    const productId = product?._id || product?.id;

    if (!productId) return;

    const confirmed = window.confirm(
      `Delete "${product.name || "this product"}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(productId);

      await productApi.deleteProduct(productId);

      setProducts((prev) =>
        prev.filter((item) => (item._id || item.id) !== productId),
      );
    } catch (err) {
      console.error("DELETE PRODUCT ERROR:", err);

      alert(err?.response?.data?.message || "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = product?.name || product?.title || "";

      const sku = product?.sku || "";

      const matchesSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        sku.toLowerCase().includes(search.toLowerCase());

      const productStatus = product?.status || "active";

      const matchesStatus = status === "all" || productStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  // ============================================================
  // STATS
  // ============================================================

  const stats = useMemo(() => {
    const total = products.length;

    const active = products.filter(
      (product) => (product?.status || "active") === "active",
    ).length;

    const draft = products.filter(
      (product) => product?.status === "draft",
    ).length;

    const published = products.filter(
      (product) => product?.status === "published",
    ).length;

    return {
      total,
      active,
      draft,
      published,
    };
  }, [products]);

  // ============================================================
  // IMAGE
  // ============================================================

  const getImage = (product) => {
    if (product?.image) {
      return product.image;
    }

    if (product?.thumbnail) {
      return product.thumbnail;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0]?.url || product.images[0];
    }

    return "";
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const StatusBadge = ({ product }) => {
    const productStatus = product?.status || "active";

    if (productStatus === "active") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </span>
      );
    }

    if (productStatus === "draft") {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
          Draft
        </span>
      );
    }

    if (productStatus === "inactive") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
          <XCircle className="h-3 w-3" />
          Inactive
        </span>
      );
    }

    if (productStatus === "published") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Published
        </span>
      );
    }

    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
        {productStatus}
      </span>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-gray-200 bg-white">
        <div className="px-5 py-5 md:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT */}

            <div>
              {/* Breadcrumb */}

              <div className="mb-2.5 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 text-gray-500 transition hover:text-gray-800"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                <span className="text-gray-300">/</span>

                <span className="text-gray-500">Business</span>

                <span className="text-gray-300">/</span>

                <span className="font-medium text-gray-800">Products</span>
              </div>

              <h1 className="text-1xl font-bold tracking-tight text-gray-900">
                Products
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create, manage and organize your products.
              </p>
            </div>

            {/* RIGHT */}

            <div className="flex flex-wrap gap-2">
              {/* STORE */}

              {!loadingStores && stores.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedStoreId}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    className="h-10 appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                  >
                    {stores.map((store) => (
                      <option
                        key={store._id || store.id}
                        value={store._id || store.id}
                      >
                        {store.name || store.businessName || "Store"}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              )}

              {/* REFRESH */}

              <button
                type="button"
                onClick={loadProducts}
                disabled={loading}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              {/* CREATE */}

              <button
                type="button"
                onClick={() => navigate("/products/create")}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="px-5 py-6 md:px-7">
        <div className="mx-auto max-w-[1450px]">
          {/* ERROR */}

          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />

              <span>{error}</span>

              <button
                type="button"
                onClick={loadProducts}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* ==================================================
              LIBRARY CARD
          ================================================== */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {/* CARD HEADER */}

            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                {/* TITLE */}

                <div className="flex items-center gap-1.5">
                  {/* ALL */}

                  <button
                    type="button"
                    onClick={() => setStatus("all")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "all"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All ({stats.total})
                  </button>

                  {/* ACTIVE */}

                  <button
                    type="button"
                    onClick={() => setStatus("active")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "active"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Active ({stats.active})
                  </button>

                  {/* DRAFT */}

                  <button
                    type="button"
                    onClick={() => setStatus("draft")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "draft"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Draft ({stats.draft})
                  </button>
                </div>

                {/* SEARCH */}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative w-full sm:w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products..."
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                    />
                  </div>

                  {/* STATUS */}

                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-xs font-medium text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100 sm:w-[145px]"
                    >
                      <option value="all">All Status</option>

                      <option value="active">Active</option>

                      <option value="draft">Draft</option>

                      <option value="inactive">Inactive</option>

                      <option value="published">Published</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* ==================================================
                  TABS
              ================================================== */}
            </div>

            {/* ==================================================
                TABLE
            ================================================== */}

            {loading ? (
              <LoadingState />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                search={search}
                onCreate={() => navigate("/products/create")}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  {/* HEAD */}

                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Price
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Stock
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  {/* BODY */}

                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => {
                      const productId = product._id || product.id;

                      const image = getImage(product);

                      const stock = Number(
                        product?.stock ?? product?.quantity ?? 0,
                      );

                      return (
                        <tr
                          key={productId}
                          className="transition hover:bg-gray-50/70"
                        >
                          {/* PRODUCT */}

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={product.name || "Product"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-4 w-4 text-gray-300" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-gray-900">
                                  {product.name ||
                                    product.title ||
                                    "Unnamed Product"}
                                </p>

                                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                  {product.category?.name ||
                                    product.categoryName ||
                                    "No category"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}

                          <td className="px-4 py-3.5 text-xs text-gray-600">
                            {product.sku || "-"}
                          </td>

                          {/* PRICE */}

                          <td className="px-4 py-3.5">
                            <span className="text-xs font-semibold text-gray-900">
                              ₹
                              {Number(
                                product.price ?? product.salePrice ?? 0,
                              ).toLocaleString("en-IN")}
                            </span>
                          </td>

                          {/* STOCK */}

                          <td className="px-4 py-3.5">
                            <span
                              className={`text-xs font-medium ${
                                stock <= 0
                                  ? "text-red-600"
                                  : stock <= 10
                                    ? "text-orange-600"
                                    : "text-gray-700"
                              }`}
                            >
                              {stock}
                            </span>

                            {stock <= 10 && stock > 0 && (
                              <span className="ml-1.5 text-[10px] text-orange-500">
                                Low
                              </span>
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-3.5">
                            <StatusBadge product={product} />
                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-0.5">
                              {/* EDIT */}

                              <button
                                type="button"
                                title="Edit"
                                onClick={() =>
                                  navigate(`/products/${productId}/edit`)
                                }
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                title="Delete"
                                disabled={deletingId === productId}
                                onClick={() => handleDelete(product)}
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                              >
                                {deletingId === productId ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ==================================================
                RESULT COUNT
            ================================================== */}

            {!loading && filteredProducts.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-3 text-[11px] text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {products.length}
                </span>{" "}
                products
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LOADING
// ============================================================

const LoadingState = () => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
      <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />

      <p className="mt-3 text-xs font-medium text-gray-500">
        Loading products...
      </p>
    </div>
  );
};

// ============================================================
// EMPTY
// ============================================================

const EmptyState = ({ search, onCreate }) => {
  return (
    <div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-10 text-center">
      {/* ICON */}

      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Package className="h-6 w-6 text-gray-400" />
      </div>

      {/* TITLE */}

      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        {search ? "No products found" : "No products found"}
      </h3>

      {/* DESCRIPTION */}

      <p className="mt-1 max-w-sm text-xs text-gray-500">
        {search
          ? "Try changing your search or filters."
          : "Create your first product to get started."}
      </p>

      {/* CREATE */}

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white transition hover:bg-black"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Product
        </button>
      )}
    </div>
  );
};

export default Products;
