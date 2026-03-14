import { useParams, Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/types/campaign";

export default function MessageContentDetail() {
  const { id } = useParams<{ id: string }>();
  const { campaigns } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign || !campaign.message_content) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Message content not found</p>
        <Link to="/messages"><Button variant="outline">Back to Messages</Button></Link>
      </div>
    );
  }

  const mc = campaign.message_content;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/messages" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Message Content
          </Link>
          <h1 className="text-xl font-medium mt-1">Messages — {campaign.name}</h1>
        </div>
        <Link to={`/campaigns/${id}/edit`}>
          <Button variant="outline">Edit Campaign</Button>
        </Link>
      </div>

      <div className="bg-card border rounded-sm p-4 mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Default Language</p>
        <Badge variant="outline">{LANGUAGE_LABELS[mc.default_language]}</Badge>
      </div>

      <div className="space-y-4">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const text = mc.content[lang];
          const isDefault = lang === mc.default_language;
          return (
            <div key={lang} className="bg-card border rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium">{LANGUAGE_LABELS[lang]}</p>
                {isDefault && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
              </div>
              {text?.trim() ? (
                <p className="text-sm whitespace-pre-wrap">{text}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No content</p>
              )}
              {text?.trim() && (
                <p className="text-xs text-muted-foreground mt-2">
                  {text.length} / 1600 characters
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
