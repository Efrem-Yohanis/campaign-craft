import { useCampaigns } from "@/context/CampaignContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/types/campaign";
import type { Language } from "@/types/campaign";
import { Plus, MessageSquareText, Eye } from "lucide-react";

export default function MessageContentList() {
  const { campaigns } = useCampaigns();

  const messages = campaigns
    .filter((c) => c.message_content)
    .map((c) => {
      const filledLangs = SUPPORTED_LANGUAGES.filter(
        (l) => c.message_content.content[l]?.trim()
      );
      return {
        campaignId: c.id,
        campaignName: c.name,
        status: c.status,
        defaultLang: c.message_content.default_language,
        filledLangs,
        preview: c.message_content.content[c.message_content.default_language]?.slice(0, 60) || "—",
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Message Content</h1>
          <p className="text-sm text-muted-foreground mt-1">Campaign message templates and translations</p>
        </div>
        <Link to="/campaigns/new">
          <Button className="gap-2 shadow-soft">
            <Plus className="h-4 w-4" />
            Create with Content
          </Button>
        </Link>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Campaign</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Default Language</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Languages</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Preview</th>
                <th className="text-right px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                        <MessageSquareText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No message content found.</p>
                    </div>
                  </td>
                </tr>
              )}
              {messages.map((m) => (
                <tr key={m.campaignId} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{m.campaignName}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="secondary" className="text-xs capitalize">{m.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline" className="text-xs">{LANGUAGE_LABELS[m.defaultLang]}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {m.filledLangs.map((l) => (
                        <Badge key={l} variant="secondary" className="text-xs">
                          {LANGUAGE_LABELS[l as Language]}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground truncate max-w-[200px]">{m.preview}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/messages/${m.campaignId}`}>
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
      </Card>
    </div>
  );
}
