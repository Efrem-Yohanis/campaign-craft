import { useParams, Link, useNavigate } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  LANGUAGE_LABELS,
  FREQUENCY_LABELS,
  DAY_LABELS,
  CHANNEL_LABELS,
  SCHEDULE_STATUS_LABELS,
} from "@/types/campaign";
import type { Language, CampaignStatus, Channel } from "@/types/campaign";
import {
  ArrowLeft,
  Clock,
  Users,
  MessageSquare,
  CalendarClock,
  Send,
  BarChart3,
  Radio,
} from "lucide-react";

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-secondary text-secondary-foreground",
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const c = campaigns.find((x) => x.id === id);

  if (!c) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Campaign not found.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">
          Back to campaigns
        </Link>
      </div>
    );
  }

  const filledLangs = (Object.entries(c.message_content.content) as [Language, string][]).filter(
    ([, t]) => t.trim()
  );

  const langCounts: Record<string, number> = {};
  c.audience.recipients.forEach((r) => {
    const label = LANGUAGE_LABELS[r.lang] || r.lang;
    langCounts[label] = (langCounts[label] || 0) + 1;
  });

  const p = c.progress;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{c.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(c.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
          <Badge variant="outline" className="capitalize">
            {c.schedule.schedule_type === "one_time" ? "One-time" : "Recurring"}
          </Badge>
          <Link to={`/campaigns/${c.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
        </div>
      </div>

      {/* Progress Section */}
      {p && (
        <Section icon={BarChart3} title="Campaign Progress">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{p.progress_percent.toFixed(1)}%</span>
            </div>
            <Progress value={p.progress_percent} className="h-2" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total" value={p.total_messages.toLocaleString()} />
              <StatCard label="Sent" value={p.sent_count.toLocaleString()} color="text-green-600" />
              <StatCard label="Failed" value={p.failed_count.toLocaleString()} color="text-destructive" />
              <StatCard label="Pending" value={p.pending_count.toLocaleString()} color="text-muted-foreground" />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Status: <strong className="text-foreground">{p.status}</strong></span>
              {p.started_at && <span>Started: {new Date(p.started_at).toLocaleString()}</span>}
              {p.completed_at && <span>Completed: {new Date(p.completed_at).toLocaleString()}</span>}
            </div>
          </div>
        </Section>
      )}

      {/* Campaign Info */}
      <Section icon={Radio} title="Campaign Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Campaign Name" value={c.name} />
          <Field label="Sender ID" value={c.sender_id || "—"} />
          <Field label="Status" value={c.status} className="capitalize" />
          <div>
            <span className="text-muted-foreground">Channels</span>
            <div className="mt-1 flex gap-1 flex-wrap">
              {c.channels.map((ch) => (
                <Badge key={ch} variant="secondary" className="text-xs">
                  {CHANNEL_LABELS[ch as Channel] || ch}
                </Badge>
              ))}
            </div>
          </div>
          <Field label="Created" value={new Date(c.created_at).toLocaleString()} />
          <Field label="Last Updated" value={new Date(c.updated_at).toLocaleString()} />
        </div>
      </Section>

      {/* Schedule */}
      <Section icon={CalendarClock} title="Schedule">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field
            label="Type"
            value={c.schedule.schedule_type === "one_time" ? "One-time" : "Recurring"}
          />
          <Field label="Schedule Status" value={SCHEDULE_STATUS_LABELS[c.schedule.status]} />
          <Field label="Start Date" value={new Date(c.schedule.start_date).toLocaleString()} />
          {c.schedule.end_date && (
            <Field label="End Date" value={new Date(c.schedule.end_date).toLocaleString()} />
          )}
          {c.schedule.schedule_type === "recurring" && (
            <>
              <Field label="Frequency" value={FREQUENCY_LABELS[c.schedule.frequency]} />
              <Field
                label="Run Days"
                value={c.schedule.run_days.map((d) => DAY_LABELS[d] || `Day ${d}`).join(", ")}
              />
            </>
          )}
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">Time Windows</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {c.schedule.send_times.map((st, i) => (
                <Badge key={i} variant="outline">
                  {st} – {c.schedule.end_times[i] || "—"}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Message Content */}
      <Section icon={MessageSquare} title="Message Content">
        <div className="space-y-3">
          <Field
            label="Default Language"
            value={LANGUAGE_LABELS[c.message_content.default_language]}
          />
          <Separator />
          {filledLangs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No message content defined.</p>
          ) : (
            filledLangs.map(([lang, text]) => (
              <div key={lang}>
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {LANGUAGE_LABELS[lang]}
                  {lang === c.message_content.default_language && " (default)"}
                </span>
                <p className="mt-1 text-sm bg-secondary/50 rounded-sm px-3 py-2 whitespace-pre-wrap">
                  {text}
                </p>
              </div>
            ))
          )}
        </div>
      </Section>

      {/* Audience Stats */}
      <Section icon={Users} title="Audience">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total Recipients" value={c.audience.total_count.toLocaleString()} />
          <StatCard label="Valid" value={c.audience.valid_count.toLocaleString()} color="text-green-600" />
          <StatCard label="Invalid" value={c.audience.invalid_count.toLocaleString()} color="text-destructive" />
        </div>
        {Object.keys(langCounts).length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">By Language</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(langCounts).map(([lang, count]) => (
                <Badge key={lang} variant="secondary">
                  {lang}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border rounded-sm">
      <div className="flex items-center gap-2 px-5 py-3 border-b">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <p className={`mt-0.5 font-medium ${className || ""}`}>{value}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-secondary/30 rounded-sm px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${color || ""}`}>{value}</p>
    </div>
  );
}
