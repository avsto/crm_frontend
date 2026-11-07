import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  CalendarDays,
  Clock3,
  UserRound,
  FileText,
  Loader2,
  Save,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  Video,
  Sparkles,
  Calendar,
  Building2,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

const pad = (value) => String(value).padStart(2, "0");

const getLocalDate = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const getLocalTime = (date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const formatDate = (value, options = {}) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    weekday: options.weekday,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function LeadDrawer({
  open,
  mode = "schedule",
  lead = null,
  leads = [],
  status = "demo_scheduled",
  saving = false,
  onClose,
  onSave,
  onSelectLead,
}) {
  const [date, setDate] = useState(getLocalDate());
  const [time, setTime] = useState("10:00");
  const [note, setNote] = useState("");

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getLocalDate());

  const isCalendar = mode === "calendar";

  useEffect(() => {
    if (!open || isCalendar) return;

    const existingDate = lead?.nextFollowUpAt
      ? new Date(lead.nextFollowUpAt)
      : null;

    const validDate = existingDate && !Number.isNaN(existingDate.getTime());

    setDate(validDate ? getLocalDate(existingDate) : getLocalDate());
    setTime(validDate ? getLocalTime(existingDate) : "10:00");
    setNote("");
  }, [open, isCalendar, lead]);

  const scheduledDemos = useMemo(() => {
    return leads
      .filter(
        (item) =>
          ["demo_scheduled", "demo_rescheduled"].includes(item.status) &&
          item.nextFollowUpAt &&
          !Number.isNaN(new Date(item.nextFollowUpAt).getTime()),
      )
      .sort((a, b) => new Date(a.nextFollowUpAt) - new Date(b.nextFollowUpAt));
  }, [leads]);

  const demosByDate = useMemo(() => {
    const result = {};

    scheduledDemos.forEach((item) => {
      const key = getLocalDate(new Date(item.nextFollowUpAt));
      if (!result[key]) result[key] = [];
      result[key].push(item);
    });

    return result;
  }, [scheduledDemos]);

  const selectedDemos = demosByDate[selectedDate] || [];

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const changeMonth = (direction) => {
    setCalendarMonth(new Date(year, month + direction, 1));
  };

  const previewDate = useMemo(() => {
    if (!date || !time) return null;

    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = time.split(":").map(Number);

    return new Date(y, m - 1, d, h, min);
  }, [date, time]);

  const isPastDate = previewDate && previewDate <= new Date();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!date || !time || !lead?._id || isPastDate) return;

    const scheduledDate = new Date(`${date}T${time}`);

    if (Number.isNaN(scheduledDate.getTime())) return;

    onSave?.({
      status,
      nextFollowUpAt: scheduledDate.toISOString(),
      note: note.trim() || `Demo scheduled for ${date} at ${time}`,
    });
  };

  const handleDateSelect = (day) => {
    if (!day) return;

    const key = `${year}-${pad(month + 1)}-${pad(day)}`;
    setSelectedDate(key);
  };

  const upcomingDemos = scheduledDemos.filter(
    (item) => new Date(item.nextFollowUpAt) >= new Date(),
  );

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm"
      />

      <aside className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-[760px] flex-col overflow-hidden bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              {isCalendar ? (
                <CalendarCheck size={20} />
              ) : (
                <CalendarDays size={20} />
              )}
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isCalendar
                  ? "Demo Calendar"
                  : status === "demo_rescheduled"
                    ? "Reschedule your demo"
                    : "Schedule a demo"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {isCalendar
                  ? "Manage all your upcoming meetings"
                  : "Choose a date and time for your meeting"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCHEDULE MODE */}
        {!isCalendar && (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[1fr_0.85fr]">
              {/* LEFT: FORM */}
              <div className="space-y-7 p-6 md:border-r md:border-slate-200">
                {/* Step indicator */}
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    Meeting details
                  </span>
                </div>

                {/* Lead */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Attendee
                  </label>

                  <div className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <UserRound size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {lead?.name || lead?.fullName || "Unknown Lead"}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {lead?.email || lead?.phone || "No contact details"}
                        </p>
                      </div>

                      <Check size={18} className="shrink-0 text-emerald-500" />
                    </div>

                    {lead?.companyName && (
                      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <Building2 size={14} />
                        {lead.companyName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Select date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      required
                      min={getLocalDate()}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Select time
                  </label>

                  <div className="relative">
                    <Clock3
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={13} />
                    Timezone: Asia/Kolkata (IST)
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Additional information
                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <FileText
                      size={17}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />

                    <textarea
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What would you like to discuss?"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: CALENDLY PREVIEW */}
              <div className="flex flex-col bg-slate-50/80 p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    2
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    Booking preview
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Video size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Product Demo
                      </p>
                      <p className="text-xs text-slate-500">AvstoMart CRM</p>
                    </div>
                  </div>

                  <div className="my-5 border-t border-slate-100" />

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={17}
                        className="mt-0.5 text-blue-600"
                      />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Date
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {previewDate
                            ? formatDate(previewDate, {
                                weekday: "long",
                              })
                            : "Select a date"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3 size={17} className="mt-0.5 text-blue-600" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Time
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {previewDate
                            ? formatTime(previewDate)
                            : "Select a time"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserRound size={17} className="mt-0.5 text-blue-600" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Attendee
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {lead?.name || lead?.fullName || "Unknown Lead"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-blue-50 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                      <CalendarCheck size={15} />
                      Meeting duration
                    </div>
                    <p className="mt-1 text-sm font-bold text-blue-900">
                      30 Minutes
                    </p>
                  </div>
                </div>

                {/* Tip */}
                <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
                  <div className="flex gap-2">
                    <Sparkles size={17} className="shrink-0 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        You're almost done!
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Review the booking details and save your demo schedule.
                        Your CRM notification will be updated automatically.
                      </p>
                    </div>
                  </div>
                </div>

                {isPastDate && (
                  <p className="mt-4 text-xs font-medium text-red-600">
                    Please select a future date and time.
                  </p>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !date || !time || !lead?._id || isPastDate}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <CalendarCheck size={17} />
                )}
                {saving ? "Saving..." : "Confirm Demo"}
              </button>
            </div>
          </form>
        )}

        {/* CALENDAR MODE */}
        {isCalendar && (
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[1fr_0.9fr]">
            {/* LEFT CALENDAR */}
            <div className="border-b border-slate-200 p-6 md:border-b-0 md:border-r">
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Total demos
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {scheduledDemos.length}
                  </p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-medium text-blue-600">Upcoming</p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {upcomingDemos.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {calendarMonth.toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Select a date to view bookings
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-y-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="pb-3 text-[10px] font-bold uppercase text-slate-400"
                    >
                      {day}
                    </div>
                  ),
                )}

                {calendarCells.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} />;
                  }

                  const key = `${year}-${pad(month + 1)}-${pad(day)}`;
                  const hasDemo = Boolean(demosByDate[key]?.length);
                  const isSelected = selectedDate === key;
                  const isToday = key === getLocalDate();

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md"
                          : isToday
                            ? "border border-blue-500 text-blue-600"
                            : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                      {hasDemo && (
                        <span
                          className={`absolute bottom-1 h-1 w-1 rounded-full ${
                            isSelected ? "bg-white" : "bg-blue-600"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Scheduled demos
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Selected date
                </h3>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDate(`${selectedDate}T12:00:00`)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedDemos.length} scheduled meetings
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT TIMELINE */}
            <div className="bg-slate-50/70 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Scheduled meetings
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(`${selectedDate}T12:00:00`)}
                  </p>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {selectedDemos.length}
                </span>
              </div>

              {selectedDemos.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <CalendarDays size={22} />
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    No meetings scheduled
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Choose another date to see your demos.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDemos.map((item) => (
                    <button
                      type="button"
                      key={item._id}
                      onClick={() => onSelectLead?.(item)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Video size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {item.name || item.fullName || "Unknown Lead"}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {item.companyName ||
                                item.email ||
                                item.phone ||
                                "Customer"}
                            </p>

                            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                              <Clock3 size={13} />
                              {formatTime(item.nextFollowUpAt)}
                            </div>
                          </div>
                        </div>

                        <ArrowUpRight
                          size={17}
                          className="shrink-0 text-slate-400"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Upcoming demos
                  </h3>
                  <span className="text-xs text-slate-400">
                    {upcomingDemos.length} total
                  </span>
                </div>

                <div className="space-y-2">
                  {upcomingDemos.slice(0, 8).map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => onSelectLead?.(item)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {item.name || item.fullName || "Unknown Lead"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {formatDate(item.nextFollowUpAt)} ·{" "}
                          {formatTime(item.nextFollowUpAt)}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={15}
                        className="shrink-0 text-slate-400"
                      />
                    </button>
                  ))}

                  {upcomingDemos.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
                      No upcoming demos
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
