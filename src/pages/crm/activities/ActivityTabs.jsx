import React from "react";
import {
  Activity,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  StickyNote,
} from "lucide-react";

const ActivityTabs = ({ activeTab, onChange, counts = {} }) => {
  const tabs = [
    {
      key: "all",
      label: "Activity",
      icon: Activity,
      count: counts.all,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      count: counts.whatsapp,
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      count: counts.email,
    },
    {
      key: "call",
      label: "Call",
      icon: Phone,
      count: counts.call,
    },
    {
      key: "file",
      label: "File",
      icon: FileText,
      count: counts.file,
    },
    {
      key: "note",
      label: "Note",
      icon: StickyNote,
      count: counts.note,
    },
  ];

  return (
    <div className="flex gap-5 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`relative flex shrink-0 items-center gap-1.5 pb-3 text-xs font-medium transition ${
              isActive
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />

            <span>{tab.label}</span>

            {typeof tab.count === "number" && tab.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  isActive
                    ? "bg-slate-100 text-slate-700"
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            )}

            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-900" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ActivityTabs;
