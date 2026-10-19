import React from "react";
import {
  Check,
  ArrowRight,
  UserCheck,
  Phone,
  MessageCircle,
  Mail,
  FileText,
  StickyNote,
  CircleDot,
} from "lucide-react";

const ActivityTab = ({
  activities = [],
  formatDateTime,
  formatStatus,
}) => {
  const getActivityIcon = (activity) => {
    switch (activity?.type) {
      case "created":
        return <Check className="h-4 w-4" />;

      case "status_change":
        return <ArrowRight className="h-4 w-4" />;

      case "assignment":
        return <UserCheck className="h-4 w-4" />;

      case "call":
        return <Phone className="h-4 w-4" />;

      case "whatsapp":
        return <MessageCircle className="h-4 w-4" />;

      case "email":
        return <Mail className="h-4 w-4" />;

      case "file":
        return <FileText className="h-4 w-4" />;

      case "note":
        return <StickyNote className="h-4 w-4" />;

      default:
        return <CircleDot className="h-4 w-4" />;
    }
  };

  const getActivityColor = (activity) => {
    switch (activity?.type) {
      case "created":
        return "bg-emerald-50 text-emerald-600";

      case "status_change":
        return "bg-blue-50 text-blue-600";

      case "assignment":
        return "bg-violet-50 text-violet-600";

      case "call":
        return "bg-amber-50 text-amber-600";

      case "whatsapp":
        return "bg-green-50 text-green-600";

      case "email":
        return "bg-sky-50 text-sky-600";

      case "file":
        return "bg-slate-100 text-slate-600";

      case "note":
        return "bg-yellow-50 text-yellow-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (!activities.length) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <div className="text-center">
          <CircleDot className="mx-auto h-6 w-6 text-slate-300" />

          <p className="mt-2 text-sm font-medium text-slate-500">
            No activity found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            There are no activities for this lead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {activities.length > 1 && (
        <div className="absolute bottom-5 left-[15px] top-5 w-px bg-slate-200" />
      )}

      <div className="space-y-1">
        {activities.map((activity, index) => {
          const activityColor = getActivityColor(activity);
          const metadata = activity?.metadata || {};

          const isAssignment =
            activity?.type === "assignment";

          const oldAssignedTo =
            metadata?.oldAssignedTo;

          const newAssignedTo =
            metadata?.newAssignedTo;

          return (
            <div
              key={
                activity?._id ||
                `${activity?.type}-${index}`
              }
              className="relative flex gap-3 pb-5 last:pb-0"
            >
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activityColor}`}
              >
                {getActivityIcon(activity)}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {activity?.title || "Activity"}
                    </p>

                    {activity?.description && (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {activity.description}
                      </p>
                    )}

                    {isAssignment && (
                      <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
                        {oldAssignedTo &&
                        newAssignedTo ? (
                          <p className="text-xs text-slate-500">
                            Assignment changed
                          </p>
                        ) : oldAssignedTo &&
                          !newAssignedTo ? (
                          <p className="text-xs text-slate-500">
                            Lead was unassigned
                          </p>
                        ) : !oldAssignedTo &&
                          newAssignedTo ? (
                          <p className="text-xs text-slate-500">
                            Lead was assigned
                          </p>
                        ) : null}
                      </div>
                    )}

                    {activity?.type ===
                      "status_change" &&
                      activity?.oldStatus &&
                      activity?.newStatus && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                            {formatStatus(
                              activity.oldStatus
                            )}
                          </span>

                          <ArrowRight className="h-3 w-3 text-slate-400" />

                          <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-600">
                            {formatStatus(
                              activity.newStatus
                            )}
                          </span>
                        </div>
                      )}
                  </div>

                  <span className="shrink-0 text-[10px] text-slate-400">
                    {formatDateTime(
                      activity?.createdAt
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTab;