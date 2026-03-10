import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WizardData, Language } from "@/types/campaign";
import { LANGUAGE_LABELS } from "@/types/campaign";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

const ALL_LANGUAGES: Language[] = ["en", "am", "ti", "om", "so"];

export default function StepMessages({ data, errors, update }: Props) {
  const usedLanguages = data.messages.map((m) => m.language);
  const availableLanguages = ALL_LANGUAGES.filter((l) => !usedLanguages.includes(l));

  function addLanguage(lang: Language) {
    update({ messages: [...data.messages, { language: lang, text: "" }] });
  }

  function updateMessage(index: number, text: string) {
    const msgs = [...data.messages];
    msgs[index] = { ...msgs[index], text };
    update({ messages: msgs });
  }

  function removeMessage(index: number) {
    if (data.messages.length <= 1) return;
    update({ messages: data.messages.filter((_, i) => i !== index) });
  }

  const isSms = data.channel === "SMS";

  return (
    <div className="space-y-5">
      {data.messages.map((msg, i) => (
        <div key={msg.language} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>{LANGUAGE_LABELS[msg.language]}</Label>
            {data.messages.length > 1 && (
              <button
                onClick={() => removeMessage(i)}
                className="text-xs text-destructive hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <Textarea
            value={msg.text}
            onChange={(e) => updateMessage(i, e.target.value)}
            placeholder={`Message in ${LANGUAGE_LABELS[msg.language]}`}
            rows={3}
            maxLength={isSms ? 160 : undefined}
          />
          {isSms && (
            <p className="text-xs text-muted-foreground">
              {msg.text.length}/160 characters
            </p>
          )}
        </div>
      ))}

      {errors.messages && <p className="text-sm text-destructive">{errors.messages}</p>}

      {availableLanguages.length > 0 && (
        <div className="flex items-center gap-2">
          <Select onValueChange={(v) => addLanguage(v as Language)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add language" />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((l) => (
                <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
