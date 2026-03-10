import { useState } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CampaignStatus } from "@/types/campaign";
import CampaignDetailDialog from "@/components/CampaignDetailDialog";

export default function CampaignList() {
  const { campaigns, deleteCampaign } = useCampaigns();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "All">("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const viewCampaign = viewId ? campaigns.find((c) => c.id === viewId) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Campaigns</h1>
        <Link to="/campaigns/new">
          <Button>Create campaign</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as CampaignStatus | "All")}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Channel</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Schedule</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Start</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">End</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No campaigns found.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.channel}</td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3">{c.scheduleType}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.startDate ? new Date(c.startDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => setViewId(c.id)}
                    className="text-sm text-primary hover:underline"
                  >
                    View
                  </button>
                  <Link
                    to={`/campaigns/${c.id}/edit`}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="text-sm text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The campaign will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteCampaign(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View detail dialog */}
      {viewCampaign && (
        <CampaignDetailDialog
          campaign={viewCampaign}
          open={!!viewId}
          onClose={() => setViewId(null)}
        />
      )}
    </div>
  );
}
