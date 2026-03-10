import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WizardData, Recipient, Language } from "@/types/campaign";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "@/types/campaign";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

export default function StepAudience({ data, errors, update }: Props) {
  const [bulkInput, setBulkInput] = useState("");
  const [bulkError, setBulkError] = useState("");

  function addRecipient() {
    update({
      recipients: [...data.recipients, { msisdn: "", lang: "en" }],
    });
  }

  function removeRecipient(index: number) {
    update({
      recipients: data.recipients.filter((_, i) => i !== index),
    });
  }

  function updateRecipient(index: number, field: keyof Recipient, value: string) {
    const updated = [...data.recipients];
    updated[index] = { ...updated[index], [field]: value };
    update({ recipients: updated });
  }

  function parseBulk() {
    setBulkError("");
    const lines = bulkInput.trim().split("\n").filter((l) => l.trim());
    if (!lines.length) {
      setBulkError("No data to parse");
      return;
    }

    const phonePattern = /^\+?[1-9]\d{1,14}$/;
    const parsed: Recipient[] = [];
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(/[,\t]/).map((s) => s.trim());
      if (parts.length < 2) {
        errors.push(`Line ${i + 1}: expected "msisdn, lang"`);
        continue;
      }
      const [msisdn, lang] = parts;
      if (!phonePattern.test(msisdn)) {
        errors.push(`Line ${i + 1}: invalid phone "${msisdn}"`);
        continue;
      }
      if (!SUPPORTED_LANGUAGES.includes(lang as Language)) {
        errors.push(`Line ${i + 1}: unsupported language "${lang}"`);
        continue;
      }
      parsed.push({ msisdn, lang: lang as Language });
    }

    if (errors.length > 0) {
      setBulkError(errors.slice(0, 5).join("\n") + (errors.length > 5 ? `\n...and ${errors.length - 5} more` : ""));
      return;
    }

    update({ recipients: [...data.recipients, ...parsed] });
    setBulkInput("");
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Add recipients individually or paste in bulk. Each recipient needs a phone number (E.164) and language.
      </p>

      {/* Individual recipients */}
      {data.recipients.length > 0 && (
        <div className="space-y-2">
          <Label>Recipients ({data.recipients.length})</Label>
          <div className="max-h-60 overflow-y-auto space-y-2 border rounded-sm p-3">
            {data.recipients.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={r.msisdn}
                  onChange={(e) => updateRecipient(i, "msisdn", e.target.value)}
                  placeholder="+251912345678"
                  className="flex-1"
                />
                <Select
                  value={r.lang}
                  onValueChange={(v) => updateRecipient(i, "lang", v)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => removeRecipient(i)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addRecipient}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add recipient
      </Button>

      {errors.recipients && <p className="text-sm text-destructive">{errors.recipients}</p>}

      {/* Bulk paste */}
      <div className="space-y-1.5 pt-2 border-t">
        <Label>Bulk import (CSV format)</Label>
        <Textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder={"+251912345678, en\n+251911111111, am\n+251922222222, ti"}
          rows={5}
          className="font-mono text-sm"
        />
        {bulkError && <pre className="text-sm text-destructive whitespace-pre-wrap">{bulkError}</pre>}
        <Button type="button" variant="outline" size="sm" onClick={parseBulk} disabled={!bulkInput.trim()}>
          Parse & add
        </Button>
      </div>
    </div>
  );
}
