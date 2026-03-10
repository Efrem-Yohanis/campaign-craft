import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import type { WizardData } from "@/types/campaign";
import { EMPTY_WIZARD } from "@/types/campaign";
import StepBasics from "@/components/wizard/StepBasics";
import StepSchedule from "@/components/wizard/StepSchedule";
import StepMessages from "@/components/wizard/StepMessages";
import StepAudience from "@/components/wizard/StepAudience";
import StepReview from "@/components/wizard/StepReview";

const STEP_LABELS = [
  "Campaign Basics",
  "Schedule",
  "Message Content",
  "Audience",
  "Review & Create",
];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const { addCampaign } = useCampaigns();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({ ...EMPTY_WIZARD });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine visible steps: skip schedule if Immediate
  const isScheduled = data.scheduleType === "Scheduled";
  const visibleSteps = isScheduled
    ? [0, 1, 2, 3, 4]
    : [0, 2, 3, 4]; // skip step 1

  const currentVisibleIndex = visibleSteps.indexOf(step);
  const totalVisible = visibleSteps.length;
  const displayStepNum = currentVisibleIndex + 1;
  const displayStepLabel = STEP_LABELS[step];

  function update(partial: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors({});
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!data.name.trim()) errs.name = "Name is required";
      if (!data.channel) errs.channel = "Channel is required";
      if (data.channel === "SMS" && !data.sender.trim()) errs.sender = "Sender is required for SMS";
      if (!data.scheduleType) errs.scheduleType = "Schedule type is required";
    }

    if (step === 1) {
      if (!data.startDate) errs.startDate = "Start date is required";
      if (!data.endDate) errs.endDate = "End date is required";
      if (data.startDate && data.endDate && data.startDate >= data.endDate) {
        errs.endDate = "End date must be after start date";
      }
    }

    if (step === 2) {
      const hasMessage = data.messages.some((m) => m.text.trim().length > 0);
      if (!hasMessage) errs.messages = "At least one message is required";
    }

    if (step === 3) {
      if (!data.audienceType) errs.audienceType = "Select an audience source";
      if (data.audienceType === "file" && !data.audienceFileName) errs.audienceFile = "Upload a file";
      if (data.audienceType === "segment" && data.audienceSegments.length === 0) errs.audienceSegments = "Select at least one segment";
      if (data.audienceType === "sql" && !data.audienceSql.trim()) errs.audienceSql = "Enter a SQL query";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (!validateStep()) return;
    const idx = visibleSteps.indexOf(step);
    if (idx < visibleSteps.length - 1) {
      setStep(visibleSteps[idx + 1]);
    }
  }

  function goBack() {
    const idx = visibleSteps.indexOf(step);
    if (idx > 0) {
      setStep(visibleSteps[idx - 1]);
    }
  }

  function handleSubmit() {
    addCampaign({
      name: data.name,
      channel: data.channel as any,
      sender: data.channel === "SMS" ? data.sender : undefined,
      status: "Active",
      scheduleType: data.scheduleType as any,
      startDate: isScheduled ? data.startDate : undefined,
      endDate: isScheduled ? data.endDate : undefined,
      messages: data.messages.filter((m) => m.text.trim()),
      audience: {
        type: data.audienceType as any,
        label:
          data.audienceType === "file"
            ? data.audienceFileName || "Uploaded file"
            : data.audienceType === "segment"
              ? data.audienceSegments.join(", ")
              : data.audienceSql.slice(0, 60),
        recipientCount: data.audienceRecipientCount,
      },
    });
    navigate("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[800px]">
        <div className="bg-card border rounded-sm">
          {/* Step indicator */}
          <div className="px-6 py-4 border-b">
            <span className="text-sm text-muted-foreground">
              Step {displayStepNum} of {totalVisible}: {displayStepLabel}
            </span>
          </div>

          {/* Step content */}
          <div className="px-6 py-6 min-h-[320px]">
            {step === 0 && <StepBasics data={data} errors={errors} update={update} />}
            {step === 1 && <StepSchedule data={data} errors={errors} update={update} />}
            {step === 2 && <StepMessages data={data} errors={errors} update={update} />}
            {step === 3 && <StepAudience data={data} errors={errors} update={update} />}
            {step === 4 && <StepReview data={data} />}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t flex justify-between">
            <Button
              variant="outline"
              onClick={currentVisibleIndex === 0 ? () => navigate("/") : goBack}
            >
              {currentVisibleIndex === 0 ? "Cancel" : "Back"}
            </Button>

            {step === 4 ? (
              <Button onClick={handleSubmit}>Confirm & Submit</Button>
            ) : (
              <Button onClick={goNext}>Next</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
