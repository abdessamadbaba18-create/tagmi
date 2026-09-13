"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  HandCoins,
  MessageCircle,
  CalendarClock,
  Home,
  Megaphone,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  data: any;
}

const TYPE_ICONS: Record<string, any> = {
  LEAD: MessageCircle,
  VISIT: CalendarClock,
  OFFER: HandCoins,
  MESSAGE: MessageCircle,
  PROPERTY_APPROVED: Home,
  PROPERTY_REJECTED: AlertTriangle,
  NEW_MATCH: TrendingUp,
  SYSTEM: Megaphone,
};

const TYPE_COLORS: Record<string, string> = {
  LEAD: "bg-gold/10 text-gold",
  VISIT: "bg-gold/10 text-gold",
  OFFER: "bg-green-100 text-green-600",
  MESSAGE: "bg-sky-100 text-sky-600",
  PROPERTY_APPROVED: "bg-green-100 text-green-600",
  PROPERTY_REJECTED: "bg-red-100 text-red-600",
  NEW_MATCH: "bg-yellow-100 text-yellow-600",
  SYSTEM: "bg-gray-100 text-gray-600",
};

function getLink(type: string, data: any): string {
  if (type === "OFFER") return "/dashboard/offers";
  if (type === "LEAD") return "/dashboard/leads";
  if (type === "PROPERTY_APPROVED" || type === "PROPERTY_REJECTED")
    return "/dashboard/properties";
  if (type === "NEW_MATCH" && data?.propertyId) return `/property/${data.propertyId}`;
  return "";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s)`
              : "Aucune notification non lue"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Aucune notification</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = TYPE_ICONS[notification.type] || Megaphone;
            const colorClass = TYPE_COLORS[notification.type] || "bg-gray-100 text-gray-600";
            const link = getLink(notification.type, notification.data);
            const content = (
              <Card
                className={`transition-shadow hover:shadow-md ${
                  notification.read ? "opacity-70" : ""
                }`}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markRead(notification.id)}
                      title="Marquer comme lu"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
            return link ? (
              <Link key={notification.id} href={link} onClick={() => !notification.read && markRead(notification.id)}>
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}