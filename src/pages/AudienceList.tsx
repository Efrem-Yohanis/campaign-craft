import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAudiences, fetchAudienceSummary } from "@/lib/api/audiences";
import type { ApiAudienceListItem, AudienceSummary } from "@/lib/api/audiences";

export default function AudienceList() {
  const [audiences, setAudiences] = useState<ApiAudienceListItem[]>([]);
  const [summary, setSummary] = useState<AudienceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, [page]);

  async function loadData() {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        fetchAudiences(page, pageSize),
        page === 1 ? fetchAudienceSummary() : Promise.resolve(null),
      ]);
      setAudiences(listRes.results);
      setTotalCount(listRes.count);
      if (summaryRes) setSummary(summaryRes);
    } catch (e) {
      console.error("Failed to load audiences", e);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audiences</h1>
        <p className="text-sm text-muted-foreground mt-1">Campaign audience segments and recipients</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Audiences</p>
            <p className="text-2xl font-semibold">{summary.total_audiences}</p>
          </Card>
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Recipients</p>
            <p className="text-2xl font-semibold">{summary.total_recipients.toLocaleString()}</p>
          </Card>
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valid</p>
            <p className="text-2xl font-semibold text-emerald-600">{summary.total_valid.toLocaleString()}</p>
          </Card>
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Valid %</p>
            <p className="text-2xl font-semibold">{summary.avg_valid_percentage.toFixed(1)}%</p>
          </Card>
        </div>
      )}

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Campaign</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Valid</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Invalid</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Valid %</th>
                <th className="text-right px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-20" /></td>
                  ))}
                </tr>
              ))}
              {!loading && audiences.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No audiences found.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && audiences.map((a) => (
                <tr key={a.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{a.campaign_info?.name ?? `Campaign #${a.campaign}`}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="secondary" className="text-xs capitalize">{a.campaign_info?.status ?? "—"}</Badge>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{a.total_count.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-emerald-600">{a.valid_count.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-destructive">{a.invalid_count}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-medium ${a.valid_percentage >= 90 ? "text-emerald-600" : a.valid_percentage >= 70 ? "text-amber-600" : "text-destructive"}`}>
                      {a.valid_percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/audiences/${a.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
