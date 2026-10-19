// src/components/website/Checkout.jsx

import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  CreditCard,
  Lock,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

// ============================================================
// CONSTANTS
// ============================================================

const CART_STORAGE_KEY = "website_cart";

// ============================================================
// HELPERS
// ============================================================

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
// INPUT COMPONENT
// ============================================================

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-gray-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
      />
    </label>
  );
}

// ============================================================
// PAYMENT OPTION
// ============================================================

function PaymentOption({
  selected,
  onClick,
  title,
  description,
  icon,
  primaryColor,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
        selected ? "shadow-sm" : "border-gray-200 hover:border-gray-300"
      }`}
      style={
        selected
          ? {
              borderColor: primaryColor,
              backgroundColor: `${primaryColor}08`,
            }
          : undefined
      }
    >
      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          color: primaryColor,
          backgroundColor: `${primaryColor}12`,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-gray-950">{title}</div>

        <div className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </div>
      </div>

      {/* Radio */}
      <div
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
        style={{
          borderColor: selected ? primaryColor : "#d1d5db",
        }}
      >
        {selected && (
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: primaryColor,
            }}
          />
        )}
      </div>
    </button>
  );
}

// ============================================================
// CHECKOUT
// ============================================================

export default function Checkout({
  website,
  settings = {},
  currency = "INR",
  primaryColor = "#2563eb",
  basePath = "",
}) {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [cartItems, setCartItems] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // ==========================================================
  // LOAD CART
  // ==========================================================

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (!savedCart) {
        setCartItems([]);
        return;
      }

      const parsedCart = JSON.parse(savedCart);

      setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
    } catch (error) {
      console.error("Unable to load cart:", error);

      setCartItems([]);
    }
  }, []);

  // ==========================================================
  // TOTALS
  // ==========================================================

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item?.price || 0);

      const quantity = Number(item?.quantity || 1);

      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  // Free shipping above ₹999
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 80;

  const total = subtotal + shipping;

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + Number(item?.quantity || 1),
      0,
    );
  }, [cartItems]);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================================================
  // UPDATE QUANTITY
  // ==========================================================

  const updateQuantity = (id, quantity) => {
    const nextQuantity = Number(quantity);

    // Remove when quantity becomes zero
    if (nextQuantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedCart = cartItems.map((item) =>
      String(item.id) === String(id)
        ? {
            ...item,
            quantity: nextQuantity,
          }
        : item,
    );

    setCartItems(updatedCart);

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Unable to update cart:", error);
    }
  };

  // ==========================================================
  // REMOVE ITEM
  // ==========================================================

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(
      (item) => String(item.id) !== String(id),
    );

    setCartItems(updatedCart);

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Unable to remove cart item:", error);
    }
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    navigate(-1);
  };

  // ==========================================================
  // CONTINUE SHOPPING
  // ==========================================================

  const handleContinueShopping = () => {
    navigate(basePath || "/");
  };

  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      // ======================================================
      // ORDER DATA
      // ======================================================

      const orderData = {
        website: website?._id || website?.id || null,

        business: website?.business?._id || website?.business || null,

        customer: {
          ...form,
        },

        items: cartItems,

        subtotal,

        shipping,

        total,

        currency,

        paymentMethod,
      };

      // ======================================================
      // TEMPORARY
      // ======================================================

      console.log("ORDER DATA:", orderData);

      /*
       * =====================================================
       * ORDER API WILL COME HERE
       * =====================================================
       *
       * Example:
       *
       * const response =
       *   await orderApi.createOrder(
       *     orderData
       *   );
       *
       * =====================================================
       *
       * ONLINE PAYMENT:
       *
       * Razorpay / Stripe integration
       * will also be added here.
       *
       * =====================================================
       */

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Clear cart
      localStorage.removeItem(CART_STORAGE_KEY);

      setCartItems([]);

      // ======================================================
      // ORDER SUCCESS
      // ======================================================

      const cleanBasePath = basePath.replace(/\/+$/, "");

      navigate(`${cleanBasePath}/order-success`);
    } catch (error) {
      console.error("Place order error:", error);

      alert("Unable to place your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // EMPTY CART
  // ==========================================================

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center text-sm font-semibold text-gray-700 transition hover:text-gray-950"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </button>

            <div className="mx-auto flex items-center gap-2">
              <Lock size={16} />

              <span className="text-sm font-bold text-gray-900">
                Secure Checkout
              </span>
            </div>

            <div className="w-16" />
          </div>
        </header>

        {/* Empty Cart */}
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${primaryColor}12`,
                color: primaryColor,
              }}
            >
              <ShoppingBag size={32} />
            </div>

            <h1 className="mt-6 text-2xl font-black text-gray-950">
              Your cart is empty
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Add some products to your cart before proceeding to checkout.
            </p>

            <button
              type="button"
              onClick={handleContinueShopping}
              className="mt-7 inline-flex h-11 items-center rounded-xl px-6 text-sm font-bold text-white transition hover:opacity-90"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              Continue Shopping
              <ArrowLeft size={16} className="ml-2 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN CHECKOUT
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center text-sm font-semibold text-gray-700 transition hover:text-gray-950"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>

          {/* Center */}
          <div className="flex items-center gap-2">
            <Lock
              size={16}
              style={{
                color: primaryColor,
              }}
            />

            <span className="text-sm font-bold text-gray-900">
              Secure Checkout
            </span>
          </div>

          {/* Secure */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={16} />

            <span className="hidden sm:block">Safe & Secure</span>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            {/* =================================================
                LEFT COLUMN
            ================================================== */}

            <div className="space-y-6">
              {/* =================================================
                  CONTACT INFORMATION
              ================================================== */}

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      color: primaryColor,
                      backgroundColor: `${primaryColor}12`,
                    }}
                  >
                    <User size={19} />
                  </div>

                  {/* Heading */}
                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Contact Information
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      We'll use this information to contact you about your
                      order.
                    </p>
                  </div>
                </div>

                {/* Fields */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
                  />

                  <Input
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />

                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 9876543210"
                  />
                </div>
              </section>

              {/* =================================================
                  SHIPPING ADDRESS
              ================================================== */}

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      color: primaryColor,
                      backgroundColor: `${primaryColor}12`,
                    }}
                  >
                    <MapPin size={19} />
                  </div>

                  {/* Heading */}
                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Shipping Address
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Enter the address where you want your order delivered.
                    </p>
                  </div>
                </div>

                {/* Address Fields */}
                <div className="mt-6 space-y-4">
                  <Input
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="House no., street, area"
                  />

                  <Input
                    label="Apartment, suite, etc."
                    name="apartment"
                    value={form.apartment}
                    onChange={handleChange}
                    placeholder="Apartment, floor, landmark"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="City"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      placeholder="Kolkata"
                    />

                    <Input
                      label="State"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      placeholder="West Bengal"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                      placeholder="700001"
                    />

                    <Input
                      label="Country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                      placeholder="India"
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  PAYMENT METHOD
              ================================================== */}

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      color: primaryColor,
                      backgroundColor: `${primaryColor}12`,
                    }}
                  >
                    <CreditCard size={19} />
                  </div>

                  {/* Heading */}
                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Payment Method
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Choose how you'd like to pay for your order.
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="mt-6 space-y-3">
                  {/* COD */}
                  <PaymentOption
                    selected={paymentMethod === "cod"}
                    onClick={() => setPaymentMethod("cod")}
                    title="Cash on Delivery"
                    description="Pay when your order is delivered."
                    icon={<Truck size={19} />}
                    primaryColor={primaryColor}
                  />

                  {/* Online */}
                  <PaymentOption
                    selected={paymentMethod === "online"}
                    onClick={() => setPaymentMethod("online")}
                    title="Online Payment"
                    description="Pay securely using your preferred online payment method."
                    icon={<CreditCard size={19} />}
                    primaryColor={primaryColor}
                  />
                </div>
              </section>
            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================== */}

            <div>
              <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                {/* =================================================
                    SUMMARY HEADER
                ================================================== */}

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-gray-950">
                    Order Summary
                  </h2>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* =================================================
                    PRODUCTS
                ================================================== */}

                <div className="mt-6 max-h-[380px] space-y-4 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const quantity = Number(item?.quantity || 1);

                    const itemPrice = Number(item?.price || 0);

                    const itemTotal = itemPrice * quantity;

                    return (
                      <div key={String(item.id)} className="flex gap-3">
                        {/* Product Image */}
                        <div className="relative shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name || "Product"}
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                              <ShoppingBag
                                size={20}
                                className="text-gray-400"
                              />
                            </div>
                          )}

                          {/* Quantity Badge */}
                          <span
                            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                            style={{
                              backgroundColor: primaryColor,
                            }}
                          >
                            {quantity}
                          </span>
                        </div>

                        {/* Product Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                              {item.name || "Product"}
                            </p>

                            <p className="shrink-0 text-sm font-bold text-gray-900">
                              {formatPrice(itemTotal, currency)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-lg border border-gray-200">
                              {/* Minus */}
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, quantity - 1)
                                }
                                className="flex h-7 w-7 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                              >
                                <Minus size={13} />
                              </button>

                              {/* Quantity */}
                              <span className="w-7 text-center text-xs font-semibold text-gray-900">
                                {quantity}
                              </span>

                              {/* Plus */}
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, quantity + 1)
                                }
                                className="flex h-7 w-7 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-xs font-medium text-gray-400 transition hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* =================================================
                    TOTALS
                ================================================== */}

                <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>

                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>

                    <span className="font-semibold text-gray-900">
                      {shipping === 0
                        ? "Free"
                        : formatPrice(shipping, currency)}
                    </span>
                  </div>

                  {/* Free Shipping Message */}
                  {shipping === 0 && subtotal > 0 && (
                    <div
                      className="rounded-lg px-3 py-2 text-xs font-medium"
                      style={{
                        color: primaryColor,
                        backgroundColor: `${primaryColor}08`,
                      }}
                    >
                      🎉 You qualify for free shipping.
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-end justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-sm font-bold text-gray-950">Total</p>

                      <p className="mt-1 text-[11px] text-gray-400">
                        Including shipping
                      </p>
                    </div>

                    <span
                      className="text-2xl font-black"
                      style={{
                        color: primaryColor,
                      }}
                    >
                      {formatPrice(total, currency)}
                    </span>
                  </div>
                </div>

                {/* =================================================
                    PLACE ORDER
                ================================================== */}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="mr-2" />
                      Place Order
                    </>
                  )}
                </button>

                {/* =================================================
                    SECURITY
                ================================================== */}

                <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-gray-400">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0" />

                  <p>
                    Your personal information is protected and your checkout is
                    secure.
                  </p>
                </div>

                {/* Terms */}
                <p className="mt-4 text-center text-[10px] leading-5 text-gray-400">
                  By placing your order, you agree to our terms and conditions
                  and privacy policy.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
