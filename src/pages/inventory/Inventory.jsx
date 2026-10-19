// src/pages/inventory/Inventory.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Boxes,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import productApi from "../../api/product.api";

// ======================================================
// HELPERS
// ======================================================

const getAvailableStock = (stock = 0, reserved = 0) => {
  return Math.max(0, Number(stock || 0) - Number(reserved || 0));
};

const getStockStatus = (item) => {
  const stock = Number(item.stock || 0);
  const reorderLevel = Number(item.reorderLevel || 0);

  if (stock === 0) {
    return {
      key: "out_of_stock",
      label: "Out of Stock",
    };
  }

  if (stock <= reorderLevel) {
    return {
      key: "low_stock",
      label: "Low Stock",
    };
  }

  return {
    key: "in_stock",
    label: "In Stock",
  };
};

const normalizeProduct = (product) => {
  return {
    id: product?._id || product?.id,
    name:
      product?.name ||
      product?.productName ||
      product?.title ||
      "Unnamed Product",
    sku: product?.sku || product?.SKU || "-",
    stock: Number(
      product?.stock ?? product?.quantity ?? product?.inventory?.stock ?? 0,
    ),
    reserved: Number(
      product?.reserved ??
        product?.reservedStock ??
        product?.inventory?.reserved ??
        0,
    ),
    reorderLevel: Number(
      product?.reorderLevel ??
        product?.lowStockThreshold ??
        product?.inventory?.reorderLevel ??
        0,
    ),
    image:
      product?.image ||
      product?.thumbnail ||
      product?.images?.[0] ||
      product?.media?.[0]?.url ||
      null,
    category:
      product?.category?.name ||
      product?.categoryName ||
      (typeof product?.category === "string" ? product.category : ""),
    raw: product,
  };
};

const extractProducts = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

// ======================================================
// STOCK BADGE
// ======================================================

const StatusBadge = ({ item }) => {
  const status = getStockStatus(item);

  if (status.key === "in_stock") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        In Stock
      </span>
    );
  }

  if (status.key === "low_stock") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
        <AlertTriangle className="h-3 w-3" />
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
      <XCircle className="h-3 w-3" />
      Out of Stock
    </span>
  );
};

// ======================================================
// STOCK MODAL
// ======================================================

const StockModal = ({ item, type, onClose, onSubmit, loading }) => {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const isAdd = type === "add";

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    const currentStock = Number(item.stock || 0);

    if (!isAdd && qty > currentStock) {
      alert("Remove quantity cannot be greater than current stock.");
      return;
    }

    onSubmit({
      id: item.id,
      type,
      quantity: qty,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl border border-gray-200">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {isAdd ? "Add Stock" : "Remove Stock"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">{item.name}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-5">
            {/* CURRENT STOCK */}
            <div className="rounded-lg bg-gray-50 p-3.5 border border-gray-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Current Stock</span>
                <span className="font-semibold text-gray-900">
                  {item.stock}
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-gray-500">Reserved</span>
                <span className="font-medium text-gray-700">
                  {item.reserved}
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between border-t border-gray-200/60 pt-1.5">
                <span className="text-gray-500">Available</span>
                <span className="font-semibold text-gray-900">
                  {getAvailableStock(item.stock, item.reserved)}
                </span>
              </div>
            </div>

            {/* QUANTITY */}
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                autoFocus
                disabled={loading}
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100 disabled:bg-gray-50"
              />
            </div>

            {/* REASON */}
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                disabled={loading}
                placeholder={
                  isAdd
                    ? "e.g. New purchase received"
                    : "e.g. Damaged / manual adjustment"
                }
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-800 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3.5 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-white transition disabled:opacity-50 ${
                isAdd
                  ? "bg-[#111827] hover:bg-black"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Updating..." : isAdd ? "Add Stock" : "Remove Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ======================================================
// MAIN INVENTORY COMPONENT
// ======================================================

const Inventory = () => {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
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
  const [stockLoading, setStockLoading] = useState(false);
  const [error, setError] = useState("");

  const [openMenu, setOpenMenu] = useState(null);
  const [stockModal, setStockModal] = useState(null);

  // ====================================================
  // LOAD STORES
  // ====================================================

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

  // ====================================================
  // LOAD INVENTORY
  // ====================================================

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await productApi.getProducts({
        storeId: selectedStoreId || undefined,
      });

      const products = extractProducts(response);
      const inventoryData = products.map(normalizeProduct);

      setInventory(inventoryData);
    } catch (err) {
      console.error("INVENTORY LOAD ERROR:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load inventory";
      setError(message);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadInventory();
  }, [selectedStoreId]);

  // ====================================================
  // STORE CHANGE
  // ====================================================

  const handleStoreChange = (storeId) => {
    setSelectedStoreId(storeId);
    localStorage.setItem("selectedStoreId", storeId);
    localStorage.setItem("activeStoreId", storeId);
  };

  // ====================================================
  // STATS
  // ====================================================

  const stats = useMemo(() => {
    const totalProducts = inventory.length;

    const lowStock = inventory.filter((item) => {
      const stock = Number(item.stock || 0);
      const reorderLevel = Number(item.reorderLevel || 0);
      return stock > 0 && stock <= reorderLevel;
    }).length;

    const outOfStock = inventory.filter(
      (item) => Number(item.stock || 0) === 0,
    ).length;

    const inStock = totalProducts - (lowStock + outOfStock);

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [inventory]);

  // ====================================================
  // FILTER
  // ====================================================

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const sku = String(item.sku || "").toLowerCase();

      const matchesSearch =
        !query || name.includes(query) || sku.includes(query);

      const itemStatus = getStockStatus(item).key;
      const matchesStatus = status === "all" || itemStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, status]);

  // ====================================================
  // STOCK UPDATE
  // ====================================================

  const handleStockUpdate = async ({ id, type, quantity, reason }) => {
    try {
      setStockLoading(true);
      const item = inventory.find((product) => product.id === id);

      if (!item) throw new Error("Product not found");

      const currentStock = Number(item.stock || 0);
      let newStock = currentStock;

      if (type === "add") {
        newStock = currentStock + Number(quantity);
      } else if (type === "remove") {
        newStock = Math.max(0, currentStock - Number(quantity));
      }

      await productApi.updateStock(id, newStock);

      setStockModal(null);
      await loadInventory();
    } catch (err) {
      console.error("Stock update error:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update stock",
      );
    } finally {
      setStockLoading(false);
    }
  };

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
                <span className="font-medium text-gray-800">Inventory</span>
              </div>

              <h1 className="text-1xl font-bold tracking-tight text-gray-900">
                Inventory
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your product stock levels and inventory adjustments.
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
                onClick={loadInventory}
                disabled={loading}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              {/* CREATE PRODUCT */}
              <button
                type="button"
                onClick={() => navigate("/products/create")}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Product
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
                onClick={loadInventory}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* CARD CONTAINER */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {/* CARD HEADER */}
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStatus("all")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "all"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All ({stats.totalProducts})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("in_stock")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "in_stock"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    In Stock ({stats.inStock})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("low_stock")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "low_stock"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Low Stock ({stats.lowStock})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("out_of_stock")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      status === "out_of_stock"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Out of Stock ({stats.outOfStock})
                  </button>

                  <span className="ml-1 text-xs text-gray-400">
                    {filteredInventory.length}{" "}
                    {filteredInventory.length === 1 ? "result" : "results"}
                  </span>
                </div>

                {/* SEARCH & SELECT */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative w-full sm:w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search product or SKU..."
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-100"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-xs font-medium text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100 sm:w-[155px]"
                    >
                      <option value="all">All Stock Status</option>
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* TABS */}
            </div>

            {/* TABLE */}
            {loading ? (
              <LoadingState />
            ) : filteredInventory.length === 0 ? (
              <EmptyState
                search={search}
                onCreate={() => navigate("/products/create")}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Reserved
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Available
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Reorder Level
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredInventory.map((item) => {
                      const available = getAvailableStock(
                        item.stock,
                        item.reserved,
                      );

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-gray-50/70"
                        >
                          {/* PRODUCT */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-4 w-4 text-gray-300" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-gray-900">
                                  {item.name}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                  {item.category || "No category"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-4 py-3.5 text-xs text-gray-600">
                            {item.sku}
                          </td>

                          {/* STOCK */}
                          <td className="px-4 py-3.5 text-xs font-semibold text-gray-900">
                            {item.stock}
                          </td>

                          {/* RESERVED */}
                          <td className="px-4 py-3.5 text-xs text-gray-600">
                            {item.reserved}
                          </td>

                          {/* AVAILABLE */}
                          <td className="px-4 py-3.5 text-xs font-semibold text-gray-900">
                            {available}
                          </td>

                          {/* REORDER LEVEL */}
                          <td className="px-4 py-3.5 text-xs text-gray-600">
                            {item.reorderLevel}
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-3.5">
                            <StatusBadge item={item} />
                          </td>

                          {/* ACTIONS */}
                          <td className="relative px-5 py-3.5 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                title="Add Stock"
                                onClick={() =>
                                  setStockModal({ item, type: "add" })
                                }
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-green-50 hover:text-green-700"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                title="Remove Stock"
                                onClick={() =>
                                  setStockModal({ item, type: "remove" })
                                }
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                title="View Details"
                                onClick={() =>
                                  navigate(`/products/${item.id}/edit`)
                                }
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                              >
                                <Eye className="h-3.5 w-3.5" />
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

            {/* COUNT FOOTER */}
            {!loading && filteredInventory.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-3 text-[11px] text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {filteredInventory.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {inventory.length}
                </span>{" "}
                items
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STOCK MODAL */}
      {stockModal && (
        <StockModal
          item={stockModal.item}
          type={stockModal.type}
          onClose={() => setStockModal(null)}
          onSubmit={handleStockUpdate}
          loading={stockLoading}
        />
      )}
    </div>
  );
};

// ============================================================
// LOADING STATE
// ============================================================

const LoadingState = () => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
      <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      <p className="mt-3 text-xs font-medium text-gray-500">
        Loading inventory...
      </p>
    </div>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({ search, onCreate }) => {
  return (
    <div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Boxes className="h-6 w-6 text-gray-400" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        No inventory found
      </h3>

      <p className="mt-1 max-w-sm text-xs text-gray-500">
        {search
          ? "Try changing your search or filters."
          : "Add products to view inventory levels here."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-xs font-semibold text-white transition hover:bg-black"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Product
        </button>
      )}
    </div>
  );
};

export default Inventory;
