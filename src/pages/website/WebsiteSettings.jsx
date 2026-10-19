import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import websiteApi from "../../api/website.api";

const WebsiteSettings = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    maintenanceMode: false,
    showPoweredBy: true,
    allowIndexing: true,
    enableAnalytics: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const response = await websiteApi.getSettings(websiteId);

      const data =
        response?.data?.data ||
        response?.data?.settings ||
        response?.data ||
        {};

      setForm({
        maintenanceMode: Boolean(data.maintenanceMode),
        showPoweredBy:
          data.showPoweredBy === undefined ? true : Boolean(data.showPoweredBy),
        allowIndexing:
          data.allowIndexing === undefined ? true : Boolean(data.allowIndexing),
        enableAnalytics: Boolean(data.enableAnalytics),
      });
    } catch (error) {
      console.error("Settings loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [websiteId]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      await websiteApi.updateSettings(websiteId, form);

      alert("Website settings saved.");
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate(`/website/${websiteId}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Website
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Settings className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Website Settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Configure your website behaviour.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Setting
            title="Maintenance Mode"
            description="Temporarily hide the website from visitors."
            checked={form.maintenanceMode}
            onChange={(value) => updateField("maintenanceMode", value)}
          />

          <Setting
            title="Show Powered By"
            description="Show platform branding in the website footer."
            checked={form.showPoweredBy}
            onChange={(value) => updateField("showPoweredBy", value)}
          />

          <Setting
            title="Allow Search Engine Indexing"
            description="Allow search engines to index your website."
            checked={form.allowIndexing}
            onChange={(value) => updateField("allowIndexing", value)}
          />

          <Setting
            title="Enable Analytics"
            description="Enable website analytics tracking."
            checked={form.enableAnalytics}
            onChange={(value) => updateField("enableAnalytics", value)}
          />

          <div className="border-t border-gray-100 bg-gray-50 p-5">
            <button
              disabled={saving}
              onClick={saveSettings}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Setting = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-5 border-b border-gray-100 p-5 last:border-b-0">
    <div>
      <p className="text-sm font-semibold text-gray-900">{title}</p>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>

    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  </div>
);

export default WebsiteSettings;
