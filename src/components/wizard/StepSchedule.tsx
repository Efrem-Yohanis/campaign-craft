import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardData } from "@/types/campaign";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

export default function StepSchedule({ data, errors, update }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="startDate">Start date & time</Label>
        <Input
          id="startDate"
          type="datetime-local"
          value={data.startDate}
          onChange={(e) => update({ startDate: e.target.value })}
        />
        {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="endDate">End date & time</Label>
        <Input
          id="endDate"
          type="datetime-local"
          value={data.endDate}
          onChange={(e) => update({ endDate: e.target.value })}
        />
        {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
      </div>
    </div>
  );
}
