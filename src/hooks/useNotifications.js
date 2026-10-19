import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "../utils/storage";
import { socket, connectSocket, disconnectSocket } from "../services/socket";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      console.warn("Notifications: access token not found");
      return;
    }

    const handleNotification = (notification) => {
      if (!notification) return;

      const id =
        notification._id || notification.id || `${Date.now()}-${Math.random()}`;

      setNotifications((previous) => {
        if (previous.some((item) => item._id === id)) {
          return previous;
        }

        return [{ ...notification, _id: id }, ...previous].slice(0, 5);
      });
    };

    socket.on("notification:new", handleNotification);

    connectSocket(token);

    return () => {
      socket.off("notification:new", handleNotification);
      disconnectSocket();
    };
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((previous) => previous.filter((item) => item._id !== id));
  }, []);

  return {
    notifications,
    dismissNotification,
  };
}
