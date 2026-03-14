import { useParams, Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_LABELS } from "@/types/campaign";
import type { Language } from "@/types/campaign";

export default function AudienceDetail() {
  const { id } = useParams<{ id: string }>();
  const { campaigns } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Audience not found</p>
        <Link to="/audiences"><Button variant="outline">Back to Audiences</Button></Link>
      </div>
    );
  }

  const { audience } = campaign;
  const recipients = audience?.recipients ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/audiences" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Audiences
          </Link>
          <h1 className="text-xl font-medium mt-1">Audience — {campaign.name}</h1>
        </div>
        <Link to={`/campaigns/${id}/edit`}>
          <Button variant="outline">Edit Campaign</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Recipients</p>
          <p className="text-2xl font-medium">{audience?.total_count?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valid</p>
          <p className="text-2xl font-medium text-green-600">{audience?.valid_count?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invalid</p>
          <p className="text-2xl font-medium text-destructive">{audience?.invalid_count ?? 0}</p>
        </div>
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-secondary/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recipients</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase">#</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase">Phone (MSISDN)</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase">Language</th>
            </tr>
          </thead>
          <tbody>
            {recipients.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No recipients in this audience.
                </td>
              </tr>
            )}
            {recipients.slice(0, 100).map((r, i) => (
              <tr key={i} className="border-b last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-2 font-mono">{r.msisdn}</td>
                <td className="px-4 py-2">
                  <Badge variant="secondary" className="text-xs">
                    {LANGUAGE_LABELS[r.lang as Language] ?? r.lang}
                  </Badge>
                </td>
              </tr>
            ))}
            {recipients.length > 100 && (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-center text-muted-foreground text-xs">
                  Showing first 100 of {recipients.length.toLocaleString()} recipients
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
