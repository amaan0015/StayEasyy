
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Heart,
  House,
  CheckCheck,
  X,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notificationRef = useRef(null);

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "owner") return "/owner/dashboard";
    if (user?.role === "tenant") return "/dashboard/saved";
    return "/login";
  };

  const handleSavedClick = () => {
    navigate("/dashboard/saved");
  };

  const fetchNotifications = async () => {
    if (!user) return;

    setLoadingNotifications(true);

    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);
      return;
    }

    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [user?._id, user?.id, user?.role]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error.response?.data || error.message
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error.response?.data || error.message
      );
    }
  };

  
const handleNotificationClick = async (notification) => {
  console.log("CLICKED NOTIFICATION:", {
  type: notification.type,
  id: notification._id,
  enquiry: notification.enquiry,
});
  if (!notification.isRead) {
    await handleMarkAsRead(notification._id);
  }

  setShowNotifications(false);

  // Message notifications should open the chat page.
  if (notification.type === "new_message") {
    navigate("/chat");
    return;
  }

  // Enquiry notifications should open the relevant property.
  if (notification.enquiry?.property) {
    const propertyId =
      typeof notification.enquiry.property === "object"
        ? notification.enquiry.property._id
        : notification.enquiry.property;

    if (propertyId) {
      navigate(`/properties/${propertyId}`);
      return;
    }
  }

  // Preserve the existing fallback for other notifications.
  if (user?.role === "owner") {
    navigate("/owner/enquiries");
  } else {
    navigate(getDashboardPath());
  }
};


  return (
    <nav className="relative z-[99999] w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="relative z-[99999] flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
            <House size={20} />
          </div>

          <span className="text-xl font-bold text-slate-900">
            StayEasyy
          </span>
        </Link>

        {/* Main navigation */}
        <div className="relative z-[99999] hidden items-center gap-8 md:flex">
          <Link
            to="/properties"
            className="cursor-pointer text-sm text-slate-600 hover:text-teal-700"
          >
            Explore
          </Link>

          <Link
            to="/how-it-works"
            className="cursor-pointer text-sm text-slate-600 hover:text-teal-700"
          >
            How it works
          </Link>

          {user?.role === "owner" ? (
            <Link
              to="/owner/dashboard"
              className="cursor-pointer text-sm text-slate-600 hover:text-teal-700"
            >
              Owner Dashboard
            </Link>
          ) : !user ? (
            <Link
              to="/owner"
              className="cursor-pointer text-sm text-slate-600 hover:text-teal-700"
            >
              For owners
            </Link>
          ) : null}

          {user?.role === "admin" && (
            <Link
              to="/admin/dashboard"
              className="cursor-pointer text-sm text-slate-600 hover:text-teal-700"
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="relative z-[99999] flex items-center gap-3">
          {/* Saved properties */}
          {user?.role === "tenant" && (
            <button
              type="button"
              onClick={handleSavedClick}
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-teal-700"
              title="Saved Properties"
              aria-label="Saved Properties"
            >
              <Heart size={22} />
            </button>
          )}

          {/* Notifications */}
          {user && (
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => {
                  const willOpen = !showNotifications;
                  setShowNotifications(willOpen);

                  if (willOpen) {
                    fetchNotifications();
                  }
                }}
                className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-teal-700"
                title="Notifications"
                aria-label={`Notifications, ${unreadCount} unread`}
                aria-expanded={showNotifications}
              >
                <Bell size={22} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-[100000] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Notifications
                      </h3>
                      <p className="text-xs text-slate-500">
                        {unreadCount} unread
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900"
                          title="Mark all as read"
                        >
                          <CheckCheck size={15} />
                          Read all
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100"
                        aria-label="Close notifications"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <p className="p-6 text-center text-sm text-slate-500">
                        Loading notifications...
                      </p>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell
                          size={28}
                          className="mx-auto mb-2 text-slate-300"
                        />
                        <p className="text-sm font-medium text-slate-700">
                          No notifications yet
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Updates will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification._id}
                          type="button"
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                          className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                            notification.isRead ? "bg-white" : "bg-teal-50"
                          }`}
                        >
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              notification.isRead
                                ? "bg-slate-300"
                                : "bg-teal-600"
                            }`}
                          />

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm text-slate-800">
                              {notification.message}
                            </span>

                            <span className="mt-1 block text-xs text-slate-500">
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-200 px-4 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(getDashboardPath());
                      }}
                      className="w-full text-center text-sm font-medium text-teal-700 hover:text-teal-900"
                    >
                      View dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dashboard shortcut */}
          {user && (
            <Link
              to={getDashboardPath()}
              className="hidden rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-teal-700 sm:inline-flex"
              title="Dashboard"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={21} />
            </Link>
          )}

          {/* Owner enquiries shortcut */}
          {user?.role === "owner" && (
            <Link
              to="/owner/enquiries"
              className="hidden rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-teal-700 sm:inline-flex"
              title="My Enquiries"
              aria-label="My Enquiries"
            >
              <MessageSquare size={21} />
            </Link>
          )}

          {/* Logged-in user */}
          {user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                Hi, {user.name}
              </span>

              <button
                type="button"
                onClick={logout}
                className="relative z-[99999] cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="relative z-[99999] cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="relative z-[99999] cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
