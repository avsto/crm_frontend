import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Menu,
  GripVertical,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import websiteApi from "../../api/website.api";

const WebsiteNavigation = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [headerItems, setHeaderItems] = useState([]);
  const [footerItems, setFooterItems] = useState([]);

  const [activeTab, setActiveTab] = useState("header");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD NAVIGATION
  // ======================================================

  const loadNavigation = async () => {
    if (!websiteId) {
      setError("Website ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await websiteApi.getNavigation(websiteId);

      const data =
        response?.data?.data ||
        response?.data?.navigation ||
        response?.data ||
        {};

      // --------------------------------------------------
      // Current API structure
      //
      // {
      //   header: [],
      //   footer: []
      // }
      // --------------------------------------------------

      if (data && typeof data === "object" && !Array.isArray(data)) {
        setHeaderItems(Array.isArray(data.header) ? data.header : []);

        setFooterItems(Array.isArray(data.footer) ? data.footer : []);

        return;
      }

      // --------------------------------------------------
      // Backward compatibility
      // If API returns simple array
      // --------------------------------------------------

      if (Array.isArray(data)) {
        setHeaderItems(data);
        setFooterItems([]);
        return;
      }

      setHeaderItems([]);
      setFooterItems([]);
    } catch (error) {
      console.error("GET NAVIGATION ERROR:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load navigation.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD
  // ======================================================

  useEffect(() => {
    loadNavigation();
  }, [websiteId]);

  // ======================================================
  // ACTIVE ITEMS
  // ======================================================

  const items = activeTab === "header" ? headerItems : footerItems;

  // ======================================================
  // SET ACTIVE ITEMS
  // ======================================================

  const setItems = (newItems) => {
    if (activeTab === "header") {
      setHeaderItems(newItems);
    } else {
      setFooterItems(newItems);
    }
  };

  // ======================================================
  // ADD ITEM
  // ======================================================

  const addItem = () => {
    const newItem = {
      label: "New Menu",
      url: "/",
      type: "page",
      sortOrder: items.length,
    };

    setItems([...items, newItem]);
  };

  // ======================================================
  // UPDATE ITEM
  // ======================================================

  const updateItem = (index, field, value) => {
    setItems(
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  // ======================================================
  // REMOVE ITEM
  // ======================================================

  const removeItem = (index) => {
    const updatedItems = items
      .filter((_, itemIndex) => itemIndex !== index)
      .map((item, itemIndex) => ({
        ...item,
        sortOrder: itemIndex,
      }));

    setItems(updatedItems);
  };

  // ======================================================
  // MOVE ITEM UP
  // ======================================================

  const moveUp = (index) => {
    if (index <= 0) return;

    const updated = [...items];

    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];

    setItems(
      updated.map((item, itemIndex) => ({
        ...item,
        sortOrder: itemIndex,
      })),
    );
  };

  // ======================================================
  // MOVE ITEM DOWN
  // ======================================================

  const moveDown = (index) => {
    if (index >= items.length - 1) return;

    const updated = [...items];

    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];

    setItems(
      updated.map((item, itemIndex) => ({
        ...item,
        sortOrder: itemIndex,
      })),
    );
  };

  // ======================================================
  // SAVE
  // ======================================================

  const saveNavigation = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        navigation: {
          header: headerItems.map((item, index) => ({
            label: String(item.label || "").trim(),
            url: String(item.url || "/").trim(),
            type: item.type || "page",
            sortOrder: index,
          })),

          footer: footerItems.map((item, index) => ({
            label: String(item.label || "").trim(),
            url: String(item.url || "/").trim(),
            type: item.type || "page",
            sortOrder: index,
          })),
        },
      };

      await websiteApi.updateNavigation(websiteId, payload);

      alert("Navigation saved successfully.");
    } catch (error) {
      console.error("SAVE NAVIGATION ERROR:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save navigation.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        {/* ==================================================
            BACK
        ================================================== */}

        <button
          type="button"
          onClick={() => navigate(`/website/${websiteId}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Website
        </button>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your website header and footer menus.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addItem}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Menu
            </button>

            <button
              type="button"
              disabled={saving || loading}
              onClick={saveNavigation}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />

              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ==================================================
            TABS
        ================================================== */}

        <div className="mb-5 flex rounded-xl border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveTab("header")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "header"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Header Menu
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("footer")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "footer"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Footer Menu
          </button>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white">
          {/* LOADING */}

          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-gray-500">
                Loading navigation...
              </p>
            </div>
          ) : items.length === 0 ? (
            /* EMPTY */

            <div className="p-12 text-center">
              <Menu className="mx-auto h-10 w-10 text-gray-300" />

              <p className="mt-3 text-sm font-medium text-gray-700">
                No {activeTab} menu items
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Add a menu item to get started.
              </p>

              <button
                type="button"
                onClick={addItem}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Menu
              </button>
            </div>
          ) : (
            /* ITEMS */

            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={item._id || item.id || index} className="p-4">
                  <div className="flex gap-3">
                    {/* DRAG / ORDER */}

                    <div className="hidden pt-2 sm:block">
                      <GripVertical className="h-5 w-5 text-gray-300" />
                    </div>

                    {/* FORM */}

                    <div className="min-w-0 flex-1">
                      <div className="grid gap-3 md:grid-cols-3">
                        {/* LABEL */}

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">
                            Menu Label
                          </label>

                          <input
                            type="text"
                            value={item.label || ""}
                            onChange={(e) =>
                              updateItem(index, "label", e.target.value)
                            }
                            placeholder="Home"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        {/* URL */}

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">
                            URL
                          </label>

                          <input
                            type="text"
                            value={item.url || ""}
                            onChange={(e) =>
                              updateItem(index, "url", e.target.value)
                            }
                            placeholder="/about"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        {/* TYPE */}

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">
                            Type
                          </label>

                          <div className="relative">
                            <select
                              value={item.type || "page"}
                              onChange={(e) =>
                                updateItem(index, "type", e.target.value)
                              }
                              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="page">Page</option>

                              <option value="custom">Custom Link</option>

                              <option value="external">External Link</option>
                            </select>

                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* ORDER BUTTONS */}

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveUp(index)}
                          className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Move Up
                        </button>

                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={() => moveDown(index)}
                          className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Move Down
                        </button>

                        <span className="ml-auto text-xs text-gray-400">
                          Order: {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="self-start rounded-lg p-2 text-red-500 hover:bg-red-50"
                      title="Delete menu"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==================================================
            INFO
        ================================================== */}

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">
            Navigation structure
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Header and footer menus are stored separately. You can add internal
            pages, custom links or external links.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebsiteNavigation;
