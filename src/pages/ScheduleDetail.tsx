import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCHEDULE_TYPE_LABELS, DAY_LABELS } from "@/types/campaign";
import type { Schedule, ScheduleType } from "@/types/campaign";
import { toast } from "sonner";
import { Pencil, Save, X, Plus, Trash2 } from "lucide-react";

export default function ScheduleDetail() {
  const { id } = useParams<{ id: string }>();
  const { campaigns, updateCampaign } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Schedule | null>(null);

  if (!campaign || !campaign.schedule) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Schedule not found</p>
        <Link to="/schedules"><Button variant="outline">Back to Schedules</Button></Link>
      </div>
    );
  }

  const s = editing && draft ? draft : campaign.schedule;

  function startEdit() {
    setDraft({
      ...campaign!.schedule,
      run_days: [...(campaign!.schedule.run_days || [])],
      time_windows: campaign!.schedule.time_windows.map((tw) => ({ ...tw })),
    });
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(null);
    setEditing(false);
  }

  function saveEdit() {
    if (!draft) return;
    updateCampaign(id!, { schedule: draft });
    setEditing(false);
    setDraft(null);
    toast.success("Schedule updated");
  }

  function toggleDay(day: number) {
    if (!draft) return;
    const days = (draft.run_days || []).includes(day)
      ? (draft.run_days || []).filter((d) => d !== day)
      : [...(draft.run_days || []), day].sort();
    setDraft({ ...draft, run_days: days });
  }

  function addTimeWindow() {
    if (!draft) return;
    setDraft({ ...draft, time_windows: [...draft.time_windows, { start: "", end: "" }] });
  }

  function removeTimeWindow(i: number) {
    if (!draft || draft.time_windows.length <= 1) return;
    setDraft({ ...draft, time_windows: draft.time_windows.filter((_, idx) => idx !== i) });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/schedules" className="text-sm text-muted-foreground hover:text-foreground">← Back to Schedules</Link>
          <h1 className="text-xl font-medium mt-1">Schedule — {campaign.name}</h1>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={cancelEdit} className="gap-1.5"><X className="h-4 w-4" /> Cancel</Button>
              <Button onClick={saveEdit} className="gap-1.5"><Save className="h-4 w-4" /> Save Changes</Button>
            </>
          ) : (
            <Button variant="outline" onClick={startEdit} className="gap-1.5"><Pencil className="h-4 w-4" /> Edit Schedule</Button>
          )}
        </div>
      </div>

      {/* Schedule Type */}
      <div className="bg-card border rounded-sm p-4 mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Schedule Type</p>
        {editing ? (
          <Select value={s.schedule_type} onValueChange={(v) => setDraft({ ...draft!, schedule_type: v as ScheduleType })}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["once", "daily", "weekly", "monthly"] as ScheduleType[]).map((t) => (
                <SelectItem key={t} value={t}>{SCHEDULE_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-lg font-medium">{SCHEDULE_TYPE_LABELS[s.schedule_type]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-card border rounded-sm p-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</Label>
          {editing ? (
            <Input type="date" value={s.start_date} onChange={(e) => setDraft({ ...draft!, start_date: e.target.value })} className="mt-1" />
          ) : (
            <p className="text-sm mt-1">{s.start_date || "—"}</p>
          )}
        </div>
        {(s.schedule_type !== "once" || !editing) && (
          <div className="bg-card border rounded-sm p-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">End Date</Label>
            {editing ? (
              <Input type="date" value={s.end_date || ""} onChange={(e) => setDraft({ ...draft!, end_date: e.target.value })} className="mt-1" />
            ) : (
              <p className="text-sm mt-1">{s.end_date || "—"}</p>
            )}
          </div>
        )}
      </div>

      {/* Timezone */}
      <div className="bg-card border rounded-sm p-4 mb-4">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Timezone</Label>
        {editing ? (
          <Input value={s.timezone} onChange={(e) => setDraft({ ...draft!, timezone: e.target.value })} className="mt-1 w-64" />
        ) : (
          <p className="text-sm mt-1">{s.timezone}</p>
        )}
      </div>

      {s.schedule_type === "weekly" && (
        <div className="bg-card border rounded-sm p-4 mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Run Days</Label>
          {editing ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <label key={d} className="flex items-center gap-1.5 text-sm">
                  <Checkbox checked={(s.run_days || []).includes(d)} onCheckedChange={() => toggleDay(d)} />
                  {DAY_LABELS[d]?.slice(0, 3)}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm mt-1">{(s.run_days || []).length > 0 ? (s.run_days || []).map((d) => DAY_LABELS[d]).join(", ") : "—"}</p>
          )}
        </div>
      )}

      {/* Time Windows */}
      <div className="bg-card border rounded-sm p-4 mb-4">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Time Windows</Label>
        {editing ? (
          <div className="space-y-2 mt-1">
            {s.time_windows.map((tw, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input type="time" value={tw.start} onChange={(e) => { const windows = [...draft!.time_windows]; windows[i] = { ...windows[i], start: e.target.value }; setDraft({ ...draft!, time_windows: windows }); }} className="w-32" />
                <span className="text-muted-foreground">→</span>
                <Input type="time" value={tw.end} onChange={(e) => { const windows = [...draft!.time_windows]; windows[i] = { ...windows[i], end: e.target.value }; setDraft({ ...draft!, time_windows: windows }); }} className="w-32" />
                {s.time_windows.length > 1 && (
                  <button onClick={() => removeTimeWindow(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addTimeWindow} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Window</Button>
          </div>
        ) : s.time_windows.length > 0 ? (
          <div className="space-y-1 mt-1">
            {s.time_windows.map((tw, i) => (
              <p key={i} className="text-sm font-mono">{tw.start || "—"} → {tw.end || "—"}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">—</p>
        )}
      </div>

      {/* Active status */}
      <div className="bg-card border rounded-sm p-4">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Active</Label>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <Checkbox checked={s.is_active} onCheckedChange={(v) => setDraft({ ...draft!, is_active: !!v })} />
            <span className="text-sm">{s.is_active ? "Active" : "Inactive"}</span>
          </div>
        ) : (
          <p className={`text-lg font-medium mt-1 ${s.is_active ? "text-green-600" : "text-destructive"}`}>{s.is_active ? "Yes" : "No"}</p>
        )}
      </div>
    </div>
  );
}
