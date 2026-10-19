import React, { useEffect, useState } from "react";
import { ArrowLeft, Check, LayoutTemplate, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import websiteApi from "../../api/website.api";

const WebsiteTheme = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [themes, setThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const [themesResponse, currentResponse] = await Promise.all([
        websiteApi.getThemes(),
        websiteApi.getWebsiteTheme(websiteId),
      ]);

      const themeData =
        themesResponse?.data?.data ||
        themesResponse?.data?.themes ||
        themesResponse?.data ||
        [];

      const currentData =
        currentResponse?.data?.data ||
        currentResponse?.data?.theme ||
        currentResponse?.data ||
        null;

      setThemes(Array.isArray(themeData) ? themeData : []);
      setCurrentTheme(currentData);
    } catch (error) {
      console.error("Theme loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [websiteId]);

  const applyTheme = async (themeId) => {
    try {
      setSaving(themeId);

      await websiteApi.applyTheme(websiteId, themeId);

      await load();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to apply theme.");
    } finally {
      setSaving("");
    }
  };

  const currentThemeId =
    currentTheme?.themeId ||
    currentTheme?._id ||
    currentTheme?.id ||
    currentTheme?.theme?._id ||
    currentTheme?.theme?.id;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(`/website/${websiteId}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Website
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Website Theme</h1>

          <p className="mt-1 text-sm text-gray-500">
            Choose the design for your website.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : themes.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            No themes available.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {themes.map((theme) => {
              const id = theme._id || theme.id;
              const selected = currentThemeId === id;

              return (
                <div
                  key={id}
                  className={`overflow-hidden rounded-xl border bg-white ${
                    selected
                      ? "border-blue-600 ring-2 ring-blue-100"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100">
                    <LayoutTemplate className="h-12 w-12 text-blue-500" />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {theme.name}
                      </h3>

                      {selected && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {theme.description || "Website theme"}
                    </p>

                    <button
                      disabled={selected || saving === id}
                      onClick={() => applyTheme(id)}
                      className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === id
                        ? "Applying..."
                        : selected
                          ? "Active Theme"
                          : "Apply Theme"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteTheme;
