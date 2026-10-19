import { useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import useNotifications from "../../hooks/useNotifications";
import "./Notification.css";

const getNotificationIcon = (type) => {
  switch (String(type || "").toLowerCase()) {
    case "success":
      return <CheckCircle2 size={19} />;

    case "error":
    case "failed":
      return <AlertCircle size={19} />;

    case "warning":
      return <AlertCircle size={19} />;

    default:
      return <Bell size={19} />;
  }
};

const getTime = (date) => {
  if (!date) return "Just now";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Just now";
  }

  return parsedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
};

export default function Notification() {
  const { notifications, dismissNotification } = useNotifications();

  useEffect(() => {
    if (!notifications.length) return;
    console.log("Notifications:", notifications);
    const timers = notifications.map((item) =>
      setTimeout(() => {
        dismissNotification(item._id);
      }, 5000),
    );

    return () => timers.forEach(clearTimeout);
  }, [notifications, dismissNotification]);

  return (
    <div className="notification-container">
      {notifications.map((item) => (
        <div key={item._id} className="notification-toast" role="status">
          <div className="notification-icon">
            {getNotificationIcon(item.type)}
          </div>

          <div className="notification-content">
            <div className="notification-heading">
              <h3>{item.title || "New Notification"}</h3>

              <span className="notification-time">
                {getTime(item.createdAt)}
              </span>
            </div>

            <p>{item.message || "You have a new notification."}</p>
          </div>

          <button
            type="button"
            className="notification-close"
            aria-label="Dismiss notification"
            onClick={() => dismissNotification(item._id)}
          >
            <X size={17} />
          </button>
        </div>
      ))}
    </div>
  );
}
