// src/pages/orders/CreateOrder.jsx

import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  Check,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Truck,
  FileText,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import productApi from "../../api/product.api";
import orderApi from "../../api/order.api";

// =====================================================
// RESPONSE HELPER
// =====================================================

const extractData = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

// =====================================================
// NORMALIZE PRODUCT
// =====================================================

const normalizeProduct = (product) => ({
  id: product?._id || product?.id,

  name:
    product?.name ||
    product?.productName ||
    product?.title ||
    "Unnamed Product",

  sku: product?.sku || product?.SKU || "-",

  price: Number(
    product?.sellingPrice ??
      product?.salePrice ??
      product?.price ??
      product?.mrp ??
      0,
  ),

  stock: Number(
    product?.stock ?? product?.quantity ?? product?.inventory?.stock ?? 0,
  ),

  image:
    product?.image ||
    product?.thumbnail ||
    product?.images?.[0] ||
    product?.media?.[0]?.url ||
    null,

  raw: product,
});

// =====================================================
// CREATE ORDER
// =====================================================

const CreateOrder = () => {
  const navigate = useNavigate();

  // ===================================================
  // PRODUCTS
  // ===================================================

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ===================================================
  // ORDER ITEMS
  // ===================================================

  const [items, setItems] = useState([]);

  // ===================================================
  // CUSTOMER
  // ===================================================

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // ===================================================
  // PAYMENT
  // ===================================================

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [paymentStatus, setPaymentStatus] = useState("pending");

  // ===================================================
  // ORDER STATUS
  // ===================================================

  const [orderStatus, setOrderStatus] = useState("pending");

  // ===================================================
  // DELIVERY
  // ===================================================

  const [deliveryStatus, setDeliveryStatus] = useState("pending");

  const [courierName, setCourierName] = useState("");

  const [courierService, setCourierService] = useState("");

  const [trackingNumber, setTrackingNumber] = useState("");

  const [trackingUrl, setTrackingUrl] = useState("");

  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");

  const [deliveryNotes, setDeliveryNotes] = useState("");

  // ===================================================
  // OTHER
  // ===================================================

  const [notes, setNotes] = useState("");

  const [shippingAmount, setShippingAmount] = useState(0);

  const [discountAmount, setDiscountAmount] = useState(0);

  const [generateInvoice, setGenerateInvoice] = useState(true);

  // ===================================================
  // STATES
  // ===================================================

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      setError("");

      console.log("GET PRODUCTS API CALL");

      // IMPORTANT:
      // Product API se products fetch ho rahe hain
      const response = await productApi.getProducts();

      console.log("GET PRODUCTS RESPONSE:", response);

      const data = extractData(response).map(normalizeProduct);

      setProducts(data);
    } catch (err) {
      console.error("LOAD PRODUCTS ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load products",
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // =====================================================
  // SEARCH PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products.slice(0, 10);
    }

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query),
      )
      .slice(0, 10);
  }, [products, search]);

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  const addProduct = (product) => {
    if (!product?.id) {
      alert("Invalid product.");
      return;
    }

    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    const existing = items.find((item) => item.productId === product.id);

    // ---------------------------------------------------
    // EXISTING PRODUCT
    // ---------------------------------------------------

    if (existing) {
      const nextQuantity = Number(existing.quantity) + 1;

      if (Number(product.stock) > 0 && nextQuantity > Number(product.stock)) {
        alert(`Only ${product.stock} units are available.`);

        return;
      }

      updateQuantity(product.id, nextQuantity);

      setSearch("");
      setShowProducts(false);

      return;
    }

    // ---------------------------------------------------
    // NEW PRODUCT
    // ---------------------------------------------------

    setItems((current) => [
      ...current,
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        image: product.image,
      },
    ]);

    setSearch("");
    setShowProducts(false);
  };

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  const updateQuantity = (productId, quantity) => {
    const qty = Number(quantity);

    setItems((current) =>
      current.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const maxStock = Number(item.stock || 999999);

        return {
          ...item,

          quantity: Math.max(1, Math.min(qty || 1, maxStock)),
        };
      }),
    );
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = (productId) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [items]);

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [items]);

  // =====================================================
  // TOTAL
  // =====================================================

  const total = Math.max(
    0,
    subtotal + Number(shippingAmount || 0) - Number(discountAmount || 0),
  );

  // =====================================================
  // CUSTOMER UPDATE
  // =====================================================

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // =====================================================
  // CREATE ORDER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!items.length) {
      alert("Please add at least one product.");

      return;
    }

    if (!customer.name.trim()) {
      alert("Customer name is required.");

      return;
    }

    if (!customer.phone.trim()) {
      alert("Customer phone is required.");

      return;
    }

    // ---------------------------------------------------
    // STOCK VALIDATION
    // ---------------------------------------------------

    const invalidStockItem = items.find(
      (item) => Number(item.quantity) > Number(item.stock),
    );

    if (invalidStockItem) {
      alert(
        `${invalidStockItem.name}: only ${invalidStockItem.stock} units available.`,
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      // =================================================
      // CREATE ORDER PAYLOAD
      // =================================================

      const payload = {
        // -----------------------------------------------
        // ORDER SOURCE
        // -----------------------------------------------

        source: "manual",

        // -----------------------------------------------
        // CUSTOMER
        // -----------------------------------------------

        customer: {
          name: customer.name.trim(),

          phone: customer.phone.trim(),

          email: customer.email.trim(),

          address: customer.address.trim(),

          city: customer.city.trim(),

          state: customer.state.trim(),

          pincode: customer.pincode.trim(),
        },

        // -----------------------------------------------
        // ITEMS
        // -----------------------------------------------

        items: items.map((item) => ({
          productId: item.productId,

          quantity: Number(item.quantity),

          price: Number(item.price),
        })),

        // -----------------------------------------------
        // PAYMENT
        // -----------------------------------------------

        paymentMethod,

        paymentStatus,

        // -----------------------------------------------
        // ORDER STATUS
        // -----------------------------------------------

        status: orderStatus,

        // -----------------------------------------------
        // AMOUNTS
        // -----------------------------------------------

        subtotal: Number(subtotal),

        shippingAmount: Number(shippingAmount || 0),

        discountAmount: Number(discountAmount || 0),

        total: Number(total),

        // -----------------------------------------------
        // DELIVERY
        // -----------------------------------------------

        delivery: {
          status: deliveryStatus,

          courierName: courierName.trim(),

          courierService: courierService.trim(),

          trackingNumber: trackingNumber.trim(),

          trackingUrl: trackingUrl.trim(),

          expectedDeliveryDate: expectedDeliveryDate || null,

          notes: deliveryNotes.trim(),
        },

        // -----------------------------------------------
        // NOTES
        // -----------------------------------------------

        notes: notes.trim(),

        // -----------------------------------------------
        // INVOICE
        // -----------------------------------------------

        generateInvoice,
      };

      console.log("CREATE ORDER PAYLOAD:", payload);

      // =================================================
      // CREATE ORDER API
      // =================================================

      const response = await orderApi.createOrder(payload);

      console.log("CREATE ORDER RESPONSE:", response);

      // =================================================
      // RESPONSE HANDLING
      // =================================================

      const createdOrder =
        response?.data?.data ||
        response?.data?.order ||
        response?.data ||
        response?.order ||
        response;

      const orderId = createdOrder?._id || createdOrder?.id;

      // =================================================
      // REDIRECT
      // =================================================

      if (orderId) {
        navigate(`/orders/${orderId}`);

        return;
      }

      navigate("/orders");
    } catch (err) {
      console.error("CREATE ORDER ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create order",
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>

            <p className="text-sm text-gray-500">Create a new customer order</p>
          </div>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6 xl:col-span-2">
            {/* =================================================
                CUSTOMER
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <User size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Customer Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Enter customer details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <Input
                  label="Customer Name *"
                  value={customer.name}
                  onChange={(e) => updateCustomer("name", e.target.value)}
                  placeholder="Enter customer name"
                />

                <Input
                  label="Phone *"
                  value={customer.phone}
                  onChange={(e) => updateCustomer("phone", e.target.value)}
                  placeholder="Enter phone number"
                />

                <Input
                  label="Email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => updateCustomer("email", e.target.value)}
                  placeholder="customer@example.com"
                />

                <Input
                  label="Pincode"
                  value={customer.pincode}
                  onChange={(e) => updateCustomer("pincode", e.target.value)}
                  placeholder="Enter pincode"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={customer.address}
                    onChange={(e) => updateCustomer("address", e.target.value)}
                    placeholder="Enter complete address"
                  />
                </div>

                <Input
                  label="City"
                  value={customer.city}
                  onChange={(e) => updateCustomer("city", e.target.value)}
                  placeholder="City"
                />

                <Input
                  label="State"
                  value={customer.state}
                  onChange={(e) => updateCustomer("state", e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">Order Items</h2>
              </div>

              <div className="relative p-5">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onFocus={() => setShowProducts(true)}
                    onChange={(e) => {
                      setSearch(e.target.value);

                      setShowProducts(true);
                    }}
                    placeholder="Search product by name or SKU..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* =================================================
                    PRODUCT DROPDOWN
                ================================================= */}

                {showProducts && (
                  <div className="absolute left-5 right-5 top-[78px] z-20 max-h-72 overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                    {loadingProducts ? (
                      <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
                        <RefreshCw size={16} className="animate-spin" />
                        Loading products...
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="p-5 text-center text-sm text-gray-500">
                        No products found
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProduct(product)}
                          className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={18} className="text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {product.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              SKU: {product.sku} · Stock: {product.stock}
                            </p>
                          </div>

                          <span className="font-semibold text-gray-900">
                            ₹{product.price.toFixed(2)}
                          </span>

                          <Plus size={17} className="text-blue-600" />
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* =================================================
                    ITEMS
                ================================================= */}

                <div className="mt-5">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                      <Package size={40} className="mx-auto text-gray-300" />

                      <p className="mt-3 font-medium text-gray-700">
                        No products added
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Search and select products above.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={20} className="text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              SKU: {item.sku}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Available stock: {item.stock}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="1"
                              max={item.stock || undefined}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.productId, e.target.value)
                              }
                              className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm outline-none focus:border-blue-500"
                            />

                            <div className="w-24 text-right">
                              <p className="font-semibold text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                DELIVERY
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <Truck size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Delivery Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Manage shipment and delivery
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <Select
                  label="Delivery Status"
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  options={[
                    ["pending", "Pending"],
                    ["processing", "Processing"],
                    ["shipped", "Shipped"],
                    ["out_for_delivery", "Out for Delivery"],
                    ["delivered", "Delivered"],
                    ["failed", "Failed"],
                    ["returned", "Returned"],
                    ["cancelled", "Cancelled"],
                  ]}
                />

                <Input
                  label="Courier Name"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Delhivery"
                />

                <Input
                  label="Courier Service"
                  value={courierService}
                  onChange={(e) => setCourierService(e.target.value)}
                  placeholder="e.g. Express"
                />

                <Input
                  label="Tracking Number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />

                <Input
                  label="Tracking URL"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                />

                <Input
                  label="Expected Delivery Date"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Delivery Notes
                  </label>

                  <textarea
                    rows={3}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Delivery instructions..."
                    className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                NOTES
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Order Notes
              </label>

              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this order..."
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="space-y-6">
            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="space-y-4 p-5">
                <SummaryRow label="Items" value={totalItems} />

                <SummaryRow
                  label="Subtotal"
                  value={`₹${subtotal.toFixed(2)}`}
                />

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Shipping
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={shippingAmount}
                    onChange={(e) => setShippingAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>

                    <span className="text-xl font-bold text-blue-600">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                PAYMENT
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Payment & Status
                </h2>
              </div>

              <div className="space-y-4 p-5">
                <Select
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={[
                    ["cod", "Cash on Delivery"],
                    ["online", "Online Payment"],
                    ["upi", "UPI"],
                    ["card", "Card"],
                    ["bank_transfer", "Bank Transfer"],
                  ]}
                />

                <Select
                  label="Payment Status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  options={[
                    ["pending", "Pending"],
                    ["paid", "Paid"],
                    ["failed", "Failed"],
                    ["refunded", "Refunded"],
                  ]}
                />

                <Select
                  label="Order Status"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  options={[
                    ["pending", "Pending"],
                    ["confirmed", "Confirmed"],
                    ["processing", "Processing"],
                    ["shipped", "Shipped"],
                    ["delivered", "Delivered"],
                    ["cancelled", "Cancelled"],
                  ]}
                />
              </div>
            </div>

            {/* =================================================
                INVOICE
            ================================================= */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <FileText size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">Invoice</h2>

                  <p className="text-xs text-gray-500">
                    Generate invoice automatically
                  </p>
                </div>
              </div>

              <div className="p-5">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={generateInvoice}
                    onChange={(e) => setGenerateInvoice(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Generate invoice automatically
                  </span>
                </label>
              </div>
            </div>

            {/* =================================================
                CREATE
            ================================================= */}

            <button
              type="submit"
              disabled={saving || !items.length}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <Check size={17} />
                  Create Order
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// INPUT
// =====================================================

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
    </label>

    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  </div>
);

// =====================================================
// SELECT
// =====================================================

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
    </label>

    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  </div>
);

// =====================================================
// SUMMARY ROW
// =====================================================

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500">{label}</span>

    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

export default CreateOrder;
