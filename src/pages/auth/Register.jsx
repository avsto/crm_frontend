import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();

  const { register, authLoading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loading = authLoading;

  // ======================================================
  // CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
  };

  // ======================================================
  // VALIDATION
  // ======================================================

  const validateForm = () => {
    const errors = {};

    const name = form.name.trim();
    const businessName = form.businessName.trim();
    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (!name) {
      errors.name = "Full name is required.";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!businessName) {
      errors.businessName = "Business name is required.";
    } else if (businessName.length < 2) {
      errors.businessName = "Business name must be at least 2 characters.";
    }

    if (!email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      // IMPORTANT:
      // confirmPassword backend ko bhejna zaroori hai
      await register({
        name: form.name.trim(),
        businessName: form.businessName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error("Registration error:", err);

      const responseData = err?.response?.data;

      // Backend validation errors
      if (Array.isArray(responseData?.errors)) {
        const errors = {};

        responseData.errors.forEach((item) => {
          if (item?.path) {
            errors[item.path] = item.msg;
          }
        });

        setFieldErrors(errors);

        setError(
          responseData?.message || "Please correct the highlighted fields.",
        );

        return;
      }

      setError(
        responseData?.message || err?.message || "Unable to create account.",
      );
    }
  };

  // ======================================================
  // INPUT CLASS
  // ======================================================

  const inputClass = (field) =>
    `
      h-11
      w-full
      rounded-lg
      border
      pl-10
      pr-4
      text-sm
      outline-none
      transition
      ${
        fieldErrors[field]
          ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      }
    `;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Create your account
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Start managing your business with Brielix.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* ================================================= */}
        {/* NAME */}
        {/* ================================================= */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Full name
          </label>

          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
              className={inputClass("name")}
            />
          </div>

          {fieldErrors.name && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
          )}
        </div>

        {/* ================================================= */}
        {/* BUSINESS */}
        {/* ================================================= */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Business name
          </label>

          <div className="relative">
            <Building2
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              placeholder="Your company name"
              autoComplete="organization"
              className={inputClass("businessName")}
            />
          </div>

          {fieldErrors.businessName && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.businessName}
            </p>
          )}
        </div>

        {/* ================================================= */}
        {/* EMAIL */}
        {/* ================================================= */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
              className={inputClass("email")}
            />
          </div>

          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* ================================================= */}
        {/* PASSWORD */}
        {/* ================================================= */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              className={`${inputClass("password")} pr-11`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        {/* ================================================= */}
        {/* CONFIRM PASSWORD */}
        {/* ================================================= */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Confirm password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={`${inputClass("confirmPassword")} pr-11`}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* ================================================= */}
        {/* SUBMIT */}
        {/* ================================================= */}

        <button
          type="submit"
          disabled={loading}
          className="
            mt-2
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-blue-600
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* LOGIN */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
