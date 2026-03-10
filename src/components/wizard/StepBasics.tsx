import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { WizardData, Channel, ScheduleType } from "@/types/campaign";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

const CHANNELS: Channel[] = ["SMS", "USSD", "App", "Flash", "IVR"];

export default function StepBasics({ data, errors, update }: Props) {
  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Campaign name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g. Summer Sale Kickoff"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Channel */}
      <div className="space-y-1.5">
        <Label>Channel</Label>
        <Select
          value={data.channel}
          onValueChange={(v) => update({ channel: v as Channel, sender: "" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a channel" />
          </SelectTrigger>
          <SelectContent>
            {CHANNELS.map((ch) => (
              <SelectItem key={ch} value={ch}>{ch}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.channel && <p className="text-sm text-destructive">{errors.channel}</p>}
      </div>

      {/* Sender (SMS only) */}
      {data.channel === "SMS" && (
        <div className="space-y-1.5">
          <Label htmlFor="sender">Sender</Label>
          <Input
            id="sender"
            value={data.sender}
            onChange={(e) => update({ sender: e.target.value })}
            placeholder="e.g. SHOPNOW"
          />
          {errors.sender && <p className="text-sm text-destructive">{errors.sender}</p>}
        </div>
      )}

      {/* Schedule Type */}
      <div className="space-y-1.5">
        <Label>Schedule type</Label>
        <RadioGroup
          value={data.scheduleType}
          onValueChange={(v) => update({ scheduleType: v as ScheduleType })}
          className="flex gap-6 pt-1"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="Immediate" id="immediate" />
            <Label htmlFor="immediate" className="font-normal cursor-pointer">Immediate</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="Scheduled" id="scheduled" />
            <Label htmlFor="scheduled" className="font-normal cursor-pointer">Scheduled</Label>
          </div>
        </RadioGroup>
        {errors.scheduleType && <p className="text-sm text-destructive">{errors.scheduleType}</p>}
      </div>
    </div>
  );
}
