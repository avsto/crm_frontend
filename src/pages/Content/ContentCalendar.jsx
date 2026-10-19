import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Clock3,
  Globe,
  Search,
  Share2,
  Link2,
  FileText,
  MoreHorizontal,
  CheckCircle2,
  CircleDashed,
  Edit3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import contentApi from "../../api/content.api";

/* ======================================================
   HELPERS
====================================================== */

function getApiData(response) {
  if (!response) return [];

  // axios response
  const payload = response?.data;

  // API:
  // {
  //   success: true,
  //   data: [...]
  // }
  if (payload?.success && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload?.success && payload.data?.items) {
    return payload.data.items;
  }

  if (payload?.success && payload.data?.contents) {
    return payload.data.contents;
  }

  // API directly returns:
  // { data: [...] }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.contents)) {
    return payload.contents;
  }

  // response itself is array
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

function normalizeStatus(status) {
  if (!status) return "Draft";

  const value = String(status).toLowerCase();

  if (value === "published") return "Published";
  if (value === "scheduled") return "Scheduled";
  if (value === "draft") return "Draft";

  return status;
}

function normalizeType(type) {
  if (!type) return "Blog";

  const value = String(type).toLowerCase();

  if (value === "blog") return "Blog";
  if (value === "article") return "Article";
  if (value === "news") return "News";
  if (value === "page") return "Page";

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function normalizeWebsite(website) {
  if (!website) return "Website";

  const value = String(website).toLowerCase();

  if (value === "business") return "Business Website";
  if (value === "avstomart") return "Brielix";

  return website;
}

function getContentDate(item) {
  /*
    Priority:
    1. content.publishDate
    2. scheduledAt
    3. publishedAt
    4. createdAt
  */

  if (item?.content?.publishDate) {
    const value = String(item.content.publishDate);

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  if (item?.scheduledAt) {
    const date = new Date(item.scheduledAt);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  if (item?.publishedAt) {
    const date = new Date(item.publishedAt);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  if (item?.createdAt) {
    const date = new Date(item.createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  return "";
}

function getContentTime(item) {
  if (item?.content?.publishTime) {
    return item.content.publishTime;
  }

  const dateValue = item?.scheduledAt || item?.publishedAt || item?.createdAt;

  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getDistribution(item) {
  const distribution = item?.distribution || {};
  const result = [];

  if (distribution.website === true) {
    result.push("Website");
  }

  if (distribution.facebook === true) {
    result.push("Facebook");
  }

  if (distribution.instagram === true) {
    result.push("Instagram");
  }

  if (distribution.linkedin === true) {
    result.push("LinkedIn");
  }

  if (distribution.backlink === true) {
    result.push("Backlink");
  }

  if (distribution.newsletter === true) {
    result.push("Newsletter");
  }

  return result;
}

function getSeoStatus(score) {
  const value = Number(score || 0);

  if (value >= 85) return "Excellent";
  if (value >= 70) return "Good";
  return "Needs Work";
}

function normalizeContent(item, index) {
  const seoScore = Number(item?.seoScore || 0);

  return {
    id: item?._id || item?.id || index,
    title: item?.content?.title || item?.title || "Untitled Content",

    type: normalizeType(item?.type),

    date: getContentDate(item),

    time: getContentTime(item),

    website: normalizeWebsite(item?.content?.website),

    status: normalizeStatus(item?.status),

    seo: getSeoStatus(seoScore),

    seoScore,

    distribution: getDistribution(item),

    raw: item,
  };
}

/* ======================================================
   API CALL
====================================================== */

async function fetchContentsFromApi() {
  /*
    Your content.api.js may have different method names.
    We support common names here.
  */

  if (typeof contentApi.getAll === "function") {
    return contentApi.getAll();
  }

  if (typeof contentApi.getList === "function") {
    return contentApi.getList();
  }

  if (typeof contentApi.list === "function") {
    return contentApi.list();
  }

  if (typeof contentApi.getContents === "function") {
    return contentApi.getContents();
  }

  throw new Error(
    "contentApi list method not found. Add getAll(), getList(), list(), or getContents() in content.api.js",
  );
}

/* ======================================================
   MAIN COMPONENT
====================================================== */

export default function ContentCalendar() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());

  const [view, setView] = useState("month");

  const [statusFilter, setStatusFilter] = useState("All");

  const [websiteFilter, setWebsiteFilter] = useState("All");

  const [selectedDate, setSelectedDate] = useState(null);

  const [contents, setContents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /* ======================================================
     LOAD CONTENT
  ====================================================== */

  const loadContents = async () => {
    try {
      setError("");

      const response = await fetchContentsFromApi();

      const apiContents = getApiData(response);

      const normalized = apiContents.map(normalizeContent);

      setContents(normalized);
    } catch (err) {
      console.error("CONTENT CALENDAR API ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load content.",
      );

      setContents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  /* ======================================================
     MONTH LABEL
  ====================================================== */

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  /* ======================================================
     FILTER
  ====================================================== */

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const statusMatch =
        statusFilter === "All" || item.status === statusFilter;

      const websiteMatch =
        websiteFilter === "All" || item.website === websiteFilter;

      return statusMatch && websiteMatch;
    });
  }, [contents, statusFilter, websiteFilter]);

  /* ======================================================
     WEBSITE OPTIONS
  ====================================================== */

  const websiteOptions = useMemo(() => {
    const websites = contents.map((item) => item.website).filter(Boolean);

    return ["All", ...new Set(websites)];
  }, [contents]);

  /* ======================================================
     STATS
  ====================================================== */

  const stats = useMemo(() => {
    return {
      total: contents.length,

      published: contents.filter((item) => item.status === "Published").length,

      scheduled: contents.filter((item) => item.status === "Scheduled").length,

      drafts: contents.filter((item) => item.status === "Draft").length,

      seoReady: contents.filter((item) => item.seoScore >= 70).length,
    };
  }, [contents]);

  /* ======================================================
     DATE NAVIGATION
  ====================================================== */

  const goPrevious = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );

    setSelectedDate(null);
  };

  const goNext = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

    setSelectedDate(null);
  };

  const goToday = () => {
    const today = new Date();

    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

    setSelectedDate(today.getDate());
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadContents();
  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-6">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/content")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeft size={17} />
              </button>

              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Link to="/content" className="hover:text-gray-900">
                    Content
                  </Link>

                  <span>/</span>

                  <span>Calendar</span>
                </div>

                <h1 className="text-xl font-bold text-gray-900">
                  Content Calendar
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => navigate("/content/create?type=blog")}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                <Plus size={17} />
                Create Content
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Failed to load content
              </p>

              <p className="mt-1 text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* TOP STATS */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard
            title="Total Content"
            value={loading ? "—" : stats.total}
            icon={FileText}
          />

          <StatCard
            title="Published"
            value={loading ? "—" : stats.published}
            icon={CheckCircle2}
          />

          <StatCard
            title="Scheduled"
            value={loading ? "—" : stats.scheduled}
            icon={Clock3}
          />

          <StatCard
            title="Drafts"
            value={loading ? "—" : stats.drafts}
            icon={CircleDashed}
          />

          <StatCard
            title="SEO Ready"
            value={loading ? "—" : stats.seoReady}
            icon={Search}
          />
        </div>

        {/* TOOLBAR */}

        <section className="rounded-t-2xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            {/* DATE */}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrevious}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                onClick={goToday}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Today
              </button>

              <button
                type="button"
                onClick={goNext}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight size={17} />
              </button>

              <h2 className="ml-2 text-lg font-semibold text-gray-900">
                {monthLabel}
              </h2>
            </div>

            {/* FILTERS */}

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none"
              >
                <option value="All">All Status</option>

                <option value="Draft">Draft</option>

                <option value="Scheduled">Scheduled</option>

                <option value="Published">Published</option>
              </select>

              <select
                value={websiteFilter}
                onChange={(e) => setWebsiteFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none"
              >
                {websiteOptions.map((website) => (
                  <option key={website} value={website}>
                    {website === "All" ? "All Websites" : website}
                  </option>
                ))}
              </select>

              <div className="flex overflow-hidden rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setView("month")}
                  className={`px-3 py-2 text-xs font-medium ${
                    view === "month"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600"
                  }`}
                >
                  Month
                </button>

                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`px-3 py-2 text-xs font-medium ${
                    view === "list" ? "bg-gray-900 text-white" : "text-gray-600"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* LOADING */}

        {loading ? (
          <LoadingState />
        ) : view === "month" ? (
          <CalendarGrid
            currentDate={currentDate}
            contents={filteredContents}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            navigate={navigate}
          />
        ) : (
          <ContentList contents={filteredContents} navigate={navigate} />
        )}

        {/* AUTOMATION INFO */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <CalendarDays size={19} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Automated Publishing
              </h3>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                Scheduled content can automatically publish to your connected
                website and then trigger SEO optimization, social media
                distribution and backlink workflows.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <AutomationBadge icon={Globe} text="Website" />

                <AutomationBadge icon={Search} text="SEO" />

                <AutomationBadge icon={Share2} text="Social" />

                <AutomationBadge icon={Link2} text="Backlinks" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ======================================================
   LOADING
====================================================== */

function LoadingState() {
  return (
    <div className="overflow-hidden rounded-b-2xl border-x border-b border-gray-200 bg-white">
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <RefreshCw size={28} className="mx-auto animate-spin text-gray-400" />

          <p className="mt-3 text-sm font-medium text-gray-700">
            Loading content...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Fetching content from API
          </p>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   CALENDAR GRID
====================================================== */

function CalendarGrid({
  currentDate,
  contents,
  selectedDate,
  setSelectedDate,
  navigate,
}) {
  const year = currentDate.getFullYear();

  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({
      day: daysInPreviousMonth - firstDay + i + 1,
      outside: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      outside: false,
    });
  }

  while (cells.length < 42) {
    cells.push({
      day: cells.length - daysInMonth - firstDay + 1,
      outside: true,
    });
  }

  const getItemsForDay = (day) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;

    return contents.filter((item) => item.date === date);
  };

  const today = new Date();

  const isToday = (day) => {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  return (
    <div className="overflow-hidden rounded-b-2xl border-x border-b border-gray-200 bg-white">
      {/* DAYS */}

      <div className="grid grid-cols-7 border-b border-gray-200">
        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((day) => (
          <div
            key={day}
            className="border-r border-gray-200 px-3 py-3 text-xs font-semibold text-gray-500 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* CELLS */}

      <div className="grid grid-cols-7">
        {cells.map((cell, index) => {
          const items = cell.outside ? [] : getItemsForDay(cell.day);

          const selected = selectedDate === cell.day;

          return (
            <div
              key={index}
              onClick={() => !cell.outside && setSelectedDate(cell.day)}
              className={`group min-h-[145px] border-b border-r border-gray-200 p-2 ${
                cell.outside
                  ? "bg-gray-50"
                  : "cursor-pointer bg-white hover:bg-gray-50"
              } ${selected ? "ring-2 ring-inset ring-gray-900" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                    isToday(cell.day)
                      ? "bg-gray-900 text-white"
                      : cell.outside
                        ? "text-gray-400"
                        : "text-gray-700"
                  }`}
                >
                  {cell.day}
                </span>

                {!cell.outside && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      navigate(
                        `/content/create?type=blog&date=${year}-${String(
                          month + 1,
                        ).padStart(2, "0")}-${String(cell.day).padStart(
                          2,
                          "0",
                        )}`,
                      );
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {items.slice(0, 3).map((item) => (
                  <ContentEvent key={item.id} item={item} navigate={navigate} />
                ))}

                {items.length > 3 && (
                  <p className="px-2 text-[10px] font-medium text-gray-500">
                    +{items.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ======================================================
   CONTENT EVENT
====================================================== */

function ContentEvent({ item, navigate }) {
  const statusClass = {
    Published: "border-emerald-200 bg-emerald-50 text-emerald-700",

    Scheduled: "border-blue-200 bg-blue-50 text-blue-700",

    Draft: "border-gray-200 bg-gray-50 text-gray-600",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();

        navigate(`/content/${item.id}`);
      }}
      className={`block w-full rounded-lg border p-2 text-left transition hover:shadow-sm ${
        statusClass[item.status] || statusClass.Draft
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[10px] font-semibold">
          {item.time || "--:--"}
        </span>

        <span className="text-[9px]">{item.status}</span>
      </div>

      <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-4">
        {item.title}
      </p>

      <div className="mt-1 flex items-center gap-1 text-[9px] opacity-70">
        <Globe size={9} />

        {item.website}
      </div>
    </button>
  );
}

/* ======================================================
   LIST VIEW
====================================================== */

function ContentList({ contents, navigate }) {
  return (
    <section className="overflow-hidden rounded-b-2xl border-x border-b border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                Content
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                Publish Date
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                Website
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                SEO
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                Distribution
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {contents.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                {/* CONTENT */}

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/content/${item.id}`)}
                    className="text-left"
                  >
                    <p className="text-sm font-semibold text-gray-900 hover:underline">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">{item.type}</p>
                  </button>
                </td>

                {/* DATE */}

                <td className="px-5 py-4">
                  <p className="text-sm text-gray-700">
                    {item.date ? formatDate(item.date) : "Not scheduled"}
                  </p>

                  {item.time && (
                    <p className="mt-1 text-xs text-gray-400">{item.time}</p>
                  )}
                </td>

                {/* WEBSITE */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Globe size={14} />

                    {item.website}
                  </div>
                </td>

                {/* SEO */}

                <td className="px-5 py-4">
                  <SEOStatus status={item.seo} score={item.seoScore} />
                </td>

                {/* DISTRIBUTION */}

                <td className="px-5 py-4">
                  <div className="flex max-w-[300px] flex-wrap items-center gap-1">
                    {item.distribution.length > 0 ? (
                      item.distribution.map((channel) => (
                        <span
                          key={channel}
                          className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-600"
                        >
                          {channel}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </div>
                </td>

                {/* STATUS */}

                <td className="px-5 py-4">
                  <StatusBadge status={item.status} />
                </td>

                {/* ACTION */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/content/${item.id}/edit`)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/content/${item.id}`)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      title="View"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contents.length === 0 && (
        <div className="py-16 text-center">
          <CalendarDays size={32} className="mx-auto text-gray-300" />

          <p className="mt-3 text-sm font-medium text-gray-700">
            No content found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Create content or change your filters.
          </p>

          <button
            type="button"
            onClick={() => navigate("/content/create?type=blog")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white"
          >
            <Plus size={14} />
            Create Content
          </button>
        </div>
      )}
    </section>
  );
}

/* ======================================================
   STAT CARD
====================================================== */

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   STATUS BADGE
====================================================== */

function StatusBadge({ status }) {
  const styles = {
    Published: "bg-emerald-50 text-emerald-700 border-emerald-200",

    Scheduled: "bg-blue-50 text-blue-700 border-blue-200",

    Draft: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || styles.Draft
      }`}
    >
      {status}
    </span>
  );
}

/* ======================================================
   SEO STATUS
====================================================== */

function SEOStatus({ status, score }) {
  const styles = {
    Excellent: "text-emerald-600",
    Good: "text-blue-600",
    "Needs Work": "text-amber-600",
  };

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      <Search size={13} />

      <span className={styles[status]}>{status}</span>

      {typeof score === "number" && (
        <span className="text-[10px] text-gray-400">({score})</span>
      )}
    </div>
  );
}

/* ======================================================
   AUTOMATION BADGE
====================================================== */

function AutomationBadge({ icon: Icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-medium text-gray-600">
      <Icon size={12} />

      {text}
    </span>
  );
}

/* ======================================================
   DATE FORMAT
====================================================== */

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
