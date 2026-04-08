import { useCampaigns } from "@/context/CampaignContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LANGUAGE_LABELS } from "@/types/campaign";
import type { Language } from "@/types/campaign";
import { Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AudienceList() {
  const { campaigns } = useCampaigns();

  const audiences = campaigns
    .filter((c) => c.audience && c.audience.total_count > 0)
    .map((c) => ({
      campaignId: c.id,
      campaignName: c.name,
      status: c.status,
      audience: c.audience,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audiences</h1>
        <p className="text-sm text-muted-foreground mt-1">Campaign audience segments and recipients</p>
      </div>

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
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Languages</th>
                <th className="text-right px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {audiences.length === 0 && (
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
              {audiences.map((a) => {
                const langs = [...new Set(a.audience.recipients.map((r) => r.lang))];
                return (
                  <tr key={a.campaignId} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{a.campaignName}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-xs capitalize">{a.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{a.audience.total_count.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{a.audience.valid_count.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{a.audience.invalid_count}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {langs.map((l) => (
                          <Badge key={l} variant="outline" className="text-xs">
                            {LANGUAGE_LABELS[l as Language] ?? l}
                          </Badge>
                        ))}
                        {langs.length === 0 && <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/audiences/${a.campaignId}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
