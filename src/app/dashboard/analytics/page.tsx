"use client";

import { useEffect, useState } from "react";
import { Eye, Home, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/dashboard/analytics");
      const data = await res.json();
      if (data.success) setAnalytics(data.data);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-500">Analysez les performances de vos annonces</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Vues totales",
            value: analytics?.totalViews || 0,
            icon: Eye,
            color: "text-gold",
            bg: "bg-gold/10",
          },
          {
            title: "Biens publiés",
            value: analytics?.publishedProperties || 0,
            icon: Home,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            title: "Prospects reçus",
            value: analytics?.totalLeads || 0,
            icon: Users,
            color: "text-gold",
            bg: "bg-gold/10",
          },
          {
            title: "Score moyen",
            value: analytics?.avgLeadScore || 0,
            icon: TrendingUp,
            color: "text-orange-600",
            bg: "bg-orange-100",
          },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vues par annonce</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.propertyViews?.length === 0 ? (
              <p className="text-sm text-gray-500">Pas encore de données</p>
            ) : (
              <div className="space-y-3">
                {analytics?.propertyViews?.map((pv: any) => (
                  <div key={pv.id} className="flex items-center justify-between">
                    <span className="truncate text-sm">{pv.title}</span>
                    <span className="ml-2 flex-shrink-0 text-sm font-medium text-gray-600">
                      {pv.viewCount} vues
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prospects par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.leadStatusBreakdown?.length === 0 ? (
              <p className="text-sm text-gray-500">Pas encore de données</p>
            ) : (
              <div className="space-y-3">
                {analytics?.leadStatusBreakdown?.map((ls: any) => (
                  <div key={ls.status} className="flex items-center justify-between">
                    <span className="text-sm">{ls.status}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-gold"
                          style={{
                            width: `${
                              analytics?.totalLeads
                                ? (ls.count / analytics.totalLeads) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{ls.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}