import type { WizardData } from "@/types/campaign";
import { LANGUAGE_LABELS } from "@/types/campaign";

interface Props {
  data: WizardData;
}

export default function StepReview({ data }: Props) {
  const isScheduled = data.scheduleType === "Scheduled";
  const languageList = data.messages
    .filter((m) => m.text.trim())
    .map((m) => LANGUAGE_LABELS[m.language]);
  const langText = languageList.length > 1
    ? languageList.slice(0, -1).join(", ") + " and " + languageList[languageList.length - 1]
    : languageList[0] || "none";

  const scheduleText = isScheduled
    ? `It is scheduled to begin on ${new Date(data.startDate).toLocaleString()} and end on ${new Date(data.endDate).toLocaleString()}`
    : "It is set for immediate delivery";

  const audienceText =
    data.audienceType === "file"
      ? `the uploaded file "${data.audienceFileName}"`
      : data.audienceType === "segment"
        ? `the segments: ${data.audienceSegments.join(", ")}`
        : "a SQL query";

  return (
    <div className="font-serif text-base leading-relaxed text-foreground space-y-4">
      <p>
        The campaign <strong>"{data.name}"</strong> will be sent via{" "}
        <strong>{data.channel}</strong>
        {data.channel === "SMS" && data.sender && (
          <>
            {" "}from sender <strong>"{data.sender}"</strong>
          </>
        )}
        . {scheduleText}. Messages will be delivered in <strong>{langText}</strong>.
        The audience will be sourced from {audienceText}, targeting an estimated{" "}
        <strong>{data.audienceRecipientCount.toLocaleString()} recipients</strong>.
      </p>

      {/* Message previews */}
      <div className="space-y-3 pt-2">
        <p className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-wider">
          Message previews
        </p>
        {data.messages
          .filter((m) => m.text.trim())
          .map((m) => (
            <div key={m.language} className="border rounded-sm p-3">
              <p className="text-xs font-sans text-muted-foreground mb-1">
                {LANGUAGE_LABELS[m.language]}
              </p>
              <p className="font-serif">{m.text}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
