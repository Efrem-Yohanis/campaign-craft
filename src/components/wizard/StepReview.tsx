import type { WizardData } from "@/types/campaign";
import { LANGUAGE_LABELS, FREQUENCY_LABELS, DAY_LABELS } from "@/types/campaign";
import type { Language } from "@/types/campaign";

interface Props {
  data: WizardData;
}

export default function StepReview({ data }: Props) {
  const filledLangs = (Object.entries(data.content) as [Language, string][])
    .filter(([, text]) => text.trim())
    .map(([lang]) => LANGUAGE_LABELS[lang]);

  const langText = filledLangs.length > 1
    ? filledLangs.slice(0, -1).join(", ") + " and " + filledLangs[filledLangs.length - 1]
    : filledLangs[0] || "none";

  const daysText = data.run_days.map((d) => DAY_LABELS[d] || `Day ${d}`).join(", ");

  const timeWindows = data.send_times
    .map((st, i) => `${st || "??"} – ${data.end_times[i] || "??"}`)
    .join(", ");

  return (
    <div className="font-serif text-base leading-relaxed text-foreground space-y-4">
      <p>
        The campaign <strong>"{data.name}"</strong>
        {data.sender_id && (
          <> with sender ID <strong>"{data.sender_id}"</strong></>
        )}
        {" "}is scheduled from{" "}
        <strong>{data.start_date ? new Date(data.start_date).toLocaleString() : "—"}</strong> to{" "}
        <strong>{data.end_date ? new Date(data.end_date).toLocaleString() : "—"}</strong>.
        {data.frequency && (
          <> It runs <strong>{FREQUENCY_LABELS[data.frequency]}</strong>{daysText && <> on <strong>{daysText}</strong></>}
            {timeWindows && <> during <strong>{timeWindows}</strong></>}.
          </>
        )}
        {" "}Messages will be delivered in <strong>{langText}</strong> (default: {LANGUAGE_LABELS[data.default_language]}).
        The audience contains <strong>{data.recipients.length.toLocaleString()} recipients</strong>.
      </p>

      {/* Message previews */}
      <div className="space-y-3 pt-2">
        <p className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-wider">
          Message previews
        </p>
        {(Object.entries(data.content) as [Language, string][])
          .filter(([, text]) => text.trim())
          .map(([lang, text]) => (
            <div key={lang} className="border rounded-sm p-3">
              <p className="text-xs font-sans text-muted-foreground mb-1">
                {LANGUAGE_LABELS[lang]}
                {lang === data.default_language && " (default)"}
              </p>
              <p className="font-serif">{text}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
