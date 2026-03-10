import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Campaign } from "@/types/campaign";
import { LANGUAGE_LABELS } from "@/types/campaign";

interface Props {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
}

export default function CampaignDetailDialog({ campaign, open, onClose }: Props) {
  const c = campaign;

  const scheduleText =
    c.scheduleType === "Immediate"
      ? "for immediate delivery"
      : `scheduled from ${new Date(c.startDate!).toLocaleString()} to ${new Date(c.endDate!).toLocaleString()}`;

  const languageList = c.messages.map((m) => LANGUAGE_LABELS[m.language]).join(" and ");

  const audienceText =
    c.audience.type === "file"
      ? `the uploaded file "${c.audience.label}"`
      : c.audience.type === "segment"
        ? `the segment "${c.audience.label}"`
        : "a SQL query";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Campaign Details</DialogTitle>
        </DialogHeader>
        <div className="font-serif text-base leading-relaxed text-foreground space-y-4 py-2">
          <p>
            The campaign <strong>"{c.name}"</strong> will be sent via{" "}
            <strong>{c.channel}</strong>
            {c.sender && (
              <>
                {" "}from sender <strong>"{c.sender}"</strong>
              </>
            )}
            . It is {scheduleText}. Messages will be delivered in{" "}
            <strong>{languageList}</strong>. The audience will be sourced from{" "}
            {audienceText}, targeting an estimated{" "}
            <strong>{c.audience.recipientCount.toLocaleString()} recipients</strong>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
