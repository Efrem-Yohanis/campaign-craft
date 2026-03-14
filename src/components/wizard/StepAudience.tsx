import { useState, useRef } from "react";
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
import { Plus, Trash2, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

export default function StepAudience({ data, errors, update }: Props) {
  const [bulkInput, setBulkInput] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [fileError, setFileError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const phonePattern = /^\+?[1-9]\d{1,14}$/;

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

  function parseRows(rows: string[][]): { parsed: Recipient[]; errors: string[] } {
    const parsed: Recipient[] = [];
    const errs: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const [msisdn, lang] = rows[i].map((s) => s?.toString().trim() ?? "");
      if (!msisdn) continue;
      if (!phonePattern.test(msisdn)) {
        errs.push(`Row ${i + 1}: invalid phone "${msisdn}"`);
        continue;
      }
      const normalizedLang = lang?.toLowerCase() || "en";
      if (!SUPPORTED_LANGUAGES.includes(normalizedLang as Language)) {
        errs.push(`Row ${i + 1}: unsupported language "${lang}"`);
        continue;
      }
      parsed.push({ msisdn, lang: normalizedLang as Language });
    }
    return { parsed, errors: errs };
  }

  function parseBulk() {
    setBulkError("");
    const lines = bulkInput.trim().split("\n").filter((l) => l.trim());
    if (!lines.length) {
      setBulkError("No data to parse");
      return;
    }

    const rows = lines.map((l) => l.split(/[,\t]/).map((s) => s.trim()));
    const { parsed, errors: errs } = parseRows(rows);

    if (errs.length > 0) {
      setBulkError(errs.slice(0, 5).join("\n") + (errs.length > 5 ? `\n...and ${errs.length - 5} more` : ""));
      return;
    }

    if (parsed.length === 0) {
      setBulkError("No valid recipients found");
      return;
    }

    update({ recipients: [...data.recipients, ...parsed] });
    setBulkInput("");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    setFileName("");
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      setFileError("Unsupported file type. Use .csv, .xlsx, or .xls");
      return;
    }

    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Skip header row if it looks like a header
      let startRow = 0;
      if (jsonData.length > 0) {
        const firstCell = jsonData[0][0]?.toString().toLowerCase() ?? "";
        if (["phone", "msisdn", "number", "mobile", "tel"].some((h) => firstCell.includes(h))) {
          startRow = 1;
        }
      }

      const rows = jsonData.slice(startRow).filter((r) => r.length >= 1);
      const { parsed, errors: errs } = parseRows(rows);

      if (errs.length > 0) {
        setFileError(
          `${parsed.length} valid, ${errs.length} invalid:\n` +
          errs.slice(0, 5).join("\n") +
          (errs.length > 5 ? `\n...and ${errs.length - 5} more` : "")
        );
      }

      if (parsed.length > 0) {
        update({ recipients: [...data.recipients, ...parsed] });
      } else if (errs.length === 0) {
        setFileError("No recipients found in file");
      }
    } catch {
      setFileError("Failed to read file. Please check the format.");
    }

    // Reset input so same file can be re-uploaded
    if (fileRef.current) fileRef.current.value = "";
  }

  function clearAll() {
    update({ recipients: [] });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Add recipients by importing a file (CSV/Excel), pasting in bulk, or adding individually.
        Each recipient needs a phone number (E.164) and language code.
      </p>

      {/* File upload */}
      <div className="space-y-2">
        <Label>Import from file</Label>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload CSV / Excel
          </Button>
          {fileName && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4" />
              {fileName}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          File should have columns: <code className="text-xs bg-muted px-1 rounded">phone</code>,{" "}
          <code className="text-xs bg-muted px-1 rounded">language</code> (e.g. en, am, ti, om, so)
        </p>
        {fileError && <pre className="text-sm text-destructive whitespace-pre-wrap">{fileError}</pre>}
      </div>

      {/* Bulk paste */}
      <div className="space-y-1.5 pt-2 border-t">
        <Label>Bulk paste (CSV format)</Label>
        <Textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder={"+251912345678, en\n+251911111111, am\n+251922222222, ti"}
          rows={4}
          className="font-mono text-sm"
        />
        {bulkError && <pre className="text-sm text-destructive whitespace-pre-wrap">{bulkError}</pre>}
        <Button type="button" variant="outline" size="sm" onClick={parseBulk} disabled={!bulkInput.trim()}>
          Parse & add
        </Button>
      </div>

      {/* Recipients list */}
      {data.recipients.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label>Recipients ({data.recipients.length})</Label>
            <Button type="button" variant="ghost" size="sm" className="text-destructive text-xs" onClick={clearAll}>
              Clear all
            </Button>
          </div>
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
        <Plus className="h-3.5 w-3.5 mr-1" /> Add recipient manually
      </Button>

      {errors.recipients && <p className="text-sm text-destructive">{errors.recipients}</p>}
    </div>
  );
}
