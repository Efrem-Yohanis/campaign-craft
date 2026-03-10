import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { WizardData, AudienceSourceType } from "@/types/campaign";
import { MOCK_SEGMENTS } from "@/types/campaign";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

export default function StepAudience({ data, errors, update }: Props) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate parsing: generate a random recipient count
      const count = Math.floor(Math.random() * 5000) + 100;
      update({
        audienceFile: file,
        audienceFileName: file.name,
        audienceRecipientCount: count,
      });
    }
  }

  function toggleSegment(segment: string) {
    const current = data.audienceSegments;
    const updated = current.includes(segment)
      ? current.filter((s) => s !== segment)
      : [...current, segment];
    update({
      audienceSegments: updated,
      audienceRecipientCount: updated.length * 420 + Math.floor(Math.random() * 200),
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Audience source</Label>
        <RadioGroup
          value={data.audienceType}
          onValueChange={(v) =>
            update({
              audienceType: v as AudienceSourceType,
              audienceRecipientCount: 0,
              audienceFileName: undefined,
              audienceSegments: [],
              audienceSql: "",
            })
          }
          className="flex gap-6 pt-1"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="file" id="aud-file" />
            <Label htmlFor="aud-file" className="font-normal cursor-pointer">Upload file</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="segment" id="aud-segment" />
            <Label htmlFor="aud-segment" className="font-normal cursor-pointer">Segmented list</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="sql" id="aud-sql" />
            <Label htmlFor="aud-sql" className="font-normal cursor-pointer">SQL query</Label>
          </div>
        </RadioGroup>
        {errors.audienceType && <p className="text-sm text-destructive">{errors.audienceType}</p>}
      </div>

      {/* File upload */}
      {data.audienceType === "file" && (
        <div className="space-y-1.5">
          <Label htmlFor="file-upload">Excel file</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
          {data.audienceFileName && (
            <p className="text-sm text-muted-foreground">
              {data.audienceFileName} — {data.audienceRecipientCount.toLocaleString()} recipients
            </p>
          )}
          {errors.audienceFile && <p className="text-sm text-destructive">{errors.audienceFile}</p>}
        </div>
      )}

      {/* Segment selection */}
      {data.audienceType === "segment" && (
        <div className="space-y-2">
          <Label>Select segments</Label>
          <div className="space-y-2 pt-1">
            {MOCK_SEGMENTS.map((seg) => (
              <div key={seg} className="flex items-center gap-2">
                <Checkbox
                  id={`seg-${seg}`}
                  checked={data.audienceSegments.includes(seg)}
                  onCheckedChange={() => toggleSegment(seg)}
                />
                <Label htmlFor={`seg-${seg}`} className="font-normal cursor-pointer">{seg}</Label>
              </div>
            ))}
          </div>
          {data.audienceSegments.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {data.audienceRecipientCount.toLocaleString()} estimated recipients
            </p>
          )}
          {errors.audienceSegments && <p className="text-sm text-destructive">{errors.audienceSegments}</p>}
        </div>
      )}

      {/* SQL query */}
      {data.audienceType === "sql" && (
        <div className="space-y-1.5">
          <Label htmlFor="sql-query">SQL query</Label>
          <Textarea
            id="sql-query"
            value={data.audienceSql}
            onChange={(e) => update({ audienceSql: e.target.value, audienceRecipientCount: e.target.value.trim() ? 847 : 0 })}
            placeholder="SELECT phone FROM users WHERE ..."
            rows={4}
            className="font-mono text-sm"
          />
          {data.audienceSql.trim() && (
            <p className="text-sm text-muted-foreground">
              {data.audienceRecipientCount.toLocaleString()} estimated recipients
            </p>
          )}
          {errors.audienceSql && <p className="text-sm text-destructive">{errors.audienceSql}</p>}
        </div>
      )}
    </div>
  );
}
