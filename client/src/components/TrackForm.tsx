import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Check, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  SUBGENRES,
  MOODS,
  VECTORS,
  KEYS,
  MODES,
  getDynamicQuestions,
  type DynamicQuestion,
} from "@/lib/constants";

const STEP_LABELS = [
  "Base",
  "Genre",
  "Mood",
  "Worksheet",
  "Palette",
  "Note",
];

interface FormState {
  name: string;
  artist: string;
  year: string;
  link: string;
  mainSubgenre: string;
  adjacentSubgenre: string;
  mainMood: string;
  secondaryMoods: string[];
  vector: string;
  dynamicAnswers: Record<string, any>;
  bpm: string;
  key: string;
  mode: string;
  notes: string;
}

const initialState: FormState = {
  name: "",
  artist: "",
  year: "",
  link: "",
  mainSubgenre: "",
  adjacentSubgenre: "",
  mainMood: "",
  secondaryMoods: [],
  vector: "",
  dynamicAnswers: {},
  bpm: "",
  key: "",
  mode: "",
  notes: "",
};

interface TrackFormProps {
  onComplete: (data: any) => void;
  initialData?: any;
}

export function TrackForm({ onComplete, initialData }: TrackFormProps) {
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  
  const [form, setForm] = useState<FormState>(() => {
    if (initialData) {
      return {
        ...initialState,
        ...initialData,
        dynamicAnswers: typeof initialData.dynamicAnswers === 'string' 
          ? JSON.parse(initialData.dynamicAnswers) 
          : (initialData.dynamicAnswers || {}),
        secondaryMoods: typeof initialData.secondaryMoods === 'string'
          ? JSON.parse(initialData.secondaryMoods)
          : (initialData.secondaryMoods || [])
      };
    }
    return initialState;
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialState,
        ...initialData,
        dynamicAnswers: typeof initialData.dynamicAnswers === 'string' 
          ? JSON.parse(initialData.dynamicAnswers) 
          : (initialData.dynamicAnswers || {}),
        secondaryMoods: typeof initialData.secondaryMoods === 'string'
          ? JSON.parse(initialData.secondaryMoods)
          : (initialData.secondaryMoods || [])
      });
    } else {
      setForm(initialState);
      setStep(0);
    }
  }, [initialData]);

  const canNext = useCallback(() => {
    switch (step) {
      case 0:
        return form.name.trim() !== "" && form.artist.trim() !== "";
      case 1:
        return form.mainSubgenre !== "";
      case 2:
        return form.mainMood !== "" && form.vector !== "";
      case 3:
        return true; // dynamic answers are optional
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, form]);

  const handleNext = useCallback(() => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Submit
      const payload: any = {
        ...((initialData && initialData.id) ? { id: initialData.id } : {}),
        name: form.name.trim(),
        artist: form.artist.trim(),
        year: form.year ? parseInt(form.year) : null,
        link: form.link.trim() || null,
        mainSubgenre: form.mainSubgenre,
        adjacentSubgenre: form.adjacentSubgenre || null,
        mainMood: form.mainMood,
        secondaryMoods: form.secondaryMoods.length > 0 ? JSON.stringify(form.secondaryMoods) : null,
        vector: form.vector,
        dynamicAnswers: Object.keys(form.dynamicAnswers).length > 0 ? JSON.stringify(form.dynamicAnswers) : null,
        bpm: form.bpm.trim() || null,
        key: form.key || null,
        mode: form.mode || null,
        notes: form.notes.trim() || null,
        createdAt: (initialData && initialData.createdAt) || new Date().toISOString(),
      };
      // If this was a draft, let home component know so it could delete it? 
      // Home Component or TrackForm can just delete the draft if we supply draftId.
      if (initialData && initialData.draftId) {
        payload.draftId = initialData.draftId;
      }
      onComplete(payload);
    }
  }, [step, form, onComplete, initialData]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const updateField = useCallback((field: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleSecondaryMood = useCallback((mood: string) => {
    setForm((prev) => {
      const exists = prev.secondaryMoods.includes(mood);
      if (exists) {
        return { ...prev, secondaryMoods: prev.secondaryMoods.filter((m) => m !== mood) };
      }
      if (prev.secondaryMoods.length >= 3) return prev;
      return { ...prev, secondaryMoods: [...prev.secondaryMoods, mood] };
    });
  }, []);

  const setDynamicAnswer = useCallback((questionId: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      dynamicAnswers: { ...prev.dynamicAnswers, [questionId]: value },
    }));
  }, []);

  const handleSaveDraft = useCallback(() => {
    const draftsString = localStorage.getItem("synthplus-drafts");
    let drafts = [];
    if (draftsString) {
      try { drafts = JSON.parse(draftsString); } catch(e){}
    }
    const draftId = (initialData && initialData.draftId) || `draft-${Date.now()}`;
    
    drafts = drafts.filter((d: any) => d.draftId !== draftId);
    
    drafts.push({
      ...form, 
      draftId,
      name: form.name || "Untitled Draft",
      savedAt: new Date().toLocaleDateString(),
    });
    localStorage.setItem("synthplus-drafts", JSON.stringify(drafts));
    
    toast({
      title: "Draft saved",
      description: "You can find it in the Archive.",
      className: "bg-black border-[var(--neon-pink)] text-white",
    });
  }, [form, initialData, toast]);

  const dynamicQuestions = getDynamicQuestions(
    form.mainSubgenre,
    form.mainMood,
    form.secondaryMoods
  );

  return (
    <div className="max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => {
              if (i < step) setStep(i);
            }}
            className="group flex flex-col items-center"
            data-testid={`step-indicator-${i}`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "step-dot-active scale-125"
                  : i < step
                  ? "bg-[var(--neon-pink)]/50"
                  : "bg-muted"
              }`}
            />
            <span
              className={`text-[10px] mt-1.5 transition-colors hidden sm:block ${
                i === step ? "text-[var(--neon-pink)]" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Step title */}
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          {STEP_LABELS[step]}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Step {step + 1} of 6
        </p>
      </div>

      {/* Step content */}
      <div className="space-y-4">
        {step === 0 && <Step1 form={form} updateField={updateField} />}
        {step === 1 && <Step2 form={form} updateField={updateField} />}
        {step === 2 && (
          <Step3
            form={form}
            updateField={updateField}
            toggleSecondaryMood={toggleSecondaryMood}
          />
        )}
        {step === 3 && (
          <Step4
            questions={dynamicQuestions}
            answers={form.dynamicAnswers}
            setAnswer={setDynamicAnswer}
          />
        )}
        {step === 4 && <Step5 form={form} updateField={updateField} />}
        {step === 5 && <Step6 form={form} updateField={updateField} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/50">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="text-muted-foreground"
            data-testid="button-back"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="border-border/50 text-foreground hover:border-[var(--neon-cyan)] hover:text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
        <Button
          onClick={handleNext}
          disabled={!canNext()}
          className="bg-[var(--neon-pink)] hover:bg-[var(--neon-pink)]/80 text-white"
          data-testid="button-next"
        >
          {step === 5 ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Finish
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ---- Step Components ---- */

function Step1({
  form,
  updateField,
}: {
  form: FormState;
  updateField: (f: keyof FormState, v: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Track Name <span className="text-[var(--neon-pink)]">*</span>
        </label>
        <Input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="e.g. Nightcall"
          className="bg-card border-border/50 focus:border-[var(--neon-pink)] focus:ring-[var(--neon-pink)]/20"
          data-testid="input-track-name"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Artist <span className="text-[var(--neon-pink)]">*</span>
        </label>
        <Input
          value={form.artist}
          onChange={(e) => updateField("artist", e.target.value)}
          placeholder="e.g. Kavinsky"
          className="bg-card border-border/50 focus:border-[var(--neon-pink)] focus:ring-[var(--neon-pink)]/20"
          data-testid="input-artist"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Year
        </label>
        <Input
          value={form.year}
          onChange={(e) => updateField("year", e.target.value.replace(/\D/g, ""))}
          placeholder="2013"
          className="bg-card border-border/50 focus:border-[var(--neon-pink)] focus:ring-[var(--neon-pink)]/20"
          data-testid="input-year"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Link
        </label>
        <Input
          value={form.link}
          onChange={(e) => updateField("link", e.target.value)}
          placeholder="https://..."
          className="bg-card border-border/50 focus:border-[var(--neon-pink)] focus:ring-[var(--neon-pink)]/20"
          data-testid="input-link"
        />
      </div>
    </div>
  );
}

function Step2({
  form,
  updateField,
}: {
  form: FormState;
  updateField: (f: keyof FormState, v: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-3 block">
          Main Subgenre <span className="text-[var(--neon-pink)]">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SUBGENRES.map((sg) => (
            <button
              key={sg}
              onClick={() => updateField("mainSubgenre", sg)}
              data-testid={`select-subgenre-${sg}`}
              className={`px-3 py-2 rounded-md text-xs text-left transition-all duration-200 border ${
                form.mainSubgenre === sg
                  ? "border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 text-[var(--neon-pink)] neon-glow-pink"
                  : "border-border/50 bg-card text-foreground hover:border-[var(--neon-pink)]/30"
              }`}
            >
              {sg}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-3 block">
          Adjacent Subgenre
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateField("adjacentSubgenre", "")}
            data-testid="select-adjacent-none"
            className={`px-3 py-2 rounded-md text-xs text-left transition-all duration-200 border ${
              form.adjacentSubgenre === ""
                ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]"
                : "border-border/50 bg-card text-muted-foreground hover:border-[var(--neon-cyan)]/30"
            }`}
          >
            None
          </button>
          {SUBGENRES.filter((sg) => sg !== form.mainSubgenre).map((sg) => (
            <button
              key={sg}
              onClick={() => updateField("adjacentSubgenre", sg)}
              data-testid={`select-adjacent-${sg}`}
              className={`px-3 py-2 rounded-md text-xs text-left transition-all duration-200 border ${
                form.adjacentSubgenre === sg
                  ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] neon-glow-cyan"
                  : "border-border/50 bg-card text-foreground hover:border-[var(--neon-cyan)]/30"
              }`}
            >
              {sg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3({
  form,
  updateField,
  toggleSecondaryMood,
}: {
  form: FormState;
  updateField: (f: keyof FormState, v: any) => void;
  toggleSecondaryMood: (mood: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-3 block">
          Main Mood <span className="text-[var(--neon-pink)]">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => {
                updateField("mainMood", mood);
                // If selected as main, remove from secondary
                if (form.secondaryMoods.includes(mood)) {
                  toggleSecondaryMood(mood);
                }
              }}
              data-testid={`select-mood-${mood}`}
              className={`px-3 py-2 rounded-md text-xs text-left transition-all duration-200 border ${
                form.mainMood === mood
                  ? "border-[var(--neon-violet)] bg-[var(--neon-violet)]/10 text-[var(--neon-violet)] neon-glow-violet"
                  : "border-border/50 bg-card text-foreground hover:border-[var(--neon-violet)]/30"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-3 block">
          Secondary Moods{" "}
          <span className="text-muted-foreground">(max 3)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MOODS.filter((m) => m !== form.mainMood).map((mood) => (
            <button
              key={mood}
              onClick={() => toggleSecondaryMood(mood)}
              data-testid={`select-secondary-mood-${mood}`}
              className={`px-3 py-2 rounded-md text-xs text-left transition-all duration-200 border ${
                form.secondaryMoods.includes(mood)
                  ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]"
                  : "border-border/50 bg-card text-foreground hover:border-[var(--neon-cyan)]/30"
              } ${
                form.secondaryMoods.length >= 3 && !form.secondaryMoods.includes(mood)
                  ? "opacity-40 cursor-not-allowed"
                  : ""
              }`}
              disabled={form.secondaryMoods.length >= 3 && !form.secondaryMoods.includes(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-3 block">
          General Vector/Vibe <span className="text-[var(--neon-pink)]">*</span>
        </label>
        <div className="flex gap-2">
          {VECTORS.map((v) => {
            const colors =
              v === "Bright"
                ? { border: "var(--neon-cyan)", bg: "var(--neon-cyan)" }
                : v === "Dark"
                ? { border: "var(--neon-pink)", bg: "var(--neon-pink)" }
                : { border: "var(--neon-violet)", bg: "var(--neon-violet)" };
            return (
              <button
                key={v}
                onClick={() => updateField("vector", v)}
                data-testid={`select-vector-${v}`}
                className={`flex-1 px-4 py-3 rounded-md text-sm font-medium text-center transition-all duration-200 border ${
                  form.vector === v
                    ? `border-[${colors.border}] bg-[${colors.bg}]/10 text-foreground`
                    : "border-border/50 bg-card text-muted-foreground hover:text-foreground"
                }`}
                style={
                  form.vector === v
                    ? {
                        borderColor: colors.border,
                        backgroundColor: `color-mix(in srgb, ${colors.bg} 10%, transparent)`,
                      }
                    : {}
                }
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step4({
  questions,
  answers,
  setAnswer,
}: {
  questions: DynamicQuestion[];
  answers: Record<string, any>;
  setAnswer: (id: string, value: any) => void;
}) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Select a subgenre and mood on previous steps to see questions.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div key={q.id} className="space-y-3">
          <p className="text-sm text-foreground">{q.text}</p>
          {q.type === "scale" && (
            <ScaleInput
              value={answers[q.id] as number | undefined}
              onChange={(v) => setAnswer(q.id, v)}
              questionId={q.id}
            />
          )}
          {(q.type === "choice2" || q.type === "choice3" || q.type === "choice4") && (
            <ChoiceInput
              options={q.options!}
              value={answers[q.id] as string | undefined}
              onChange={(v) => setAnswer(q.id, v)}
              questionId={q.id}
            />
          )}
          {q.type === "yesno" && (
            <ChoiceInput
              options={["Yes", "No"]}
              value={answers[q.id] as string | undefined}
              onChange={(v) => setAnswer(q.id, v)}
              questionId={q.id}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ScaleInput({
  value,
  onChange,
  questionId,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  questionId: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          data-testid={`scale-${questionId}-${n}`}
          className={`w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-xs font-medium ${
            value === n
              ? "border-[var(--neon-pink)] bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] neon-glow-pink"
              : value !== undefined && n <= value
              ? "border-[var(--neon-pink)]/40 bg-[var(--neon-pink)]/5 text-[var(--neon-pink)]/60"
              : "border-border bg-card text-muted-foreground hover:border-[var(--neon-pink)]/30"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function ChoiceInput({
  options,
  value,
  onChange,
  questionId,
}: {
  options: string[];
  value: string | undefined;
  onChange: (v: string) => void;
  questionId: string;
}) {
  return (
    <div className={`grid gap-2 ${options.length <= 2 ? "grid-cols-2" : "grid-cols-2"}`}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          data-testid={`choice-${questionId}-${opt}`}
          className={`px-3 py-2.5 rounded-md text-xs text-center transition-all duration-200 border ${
            value === opt
              ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] neon-glow-cyan"
              : "border-border/50 bg-card text-foreground hover:border-[var(--neon-cyan)]/30"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Step5({
  form,
  updateField,
}: {
  form: FormState;
  updateField: (f: keyof FormState, v: any) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          BPM
        </label>
        <Input
          value={form.bpm}
          onChange={(e) => updateField("bpm", e.target.value)}
          placeholder='Number or range, e.g. "110-120"'
          className="bg-card border-border/50 focus:border-[var(--neon-pink)] focus:ring-[var(--neon-pink)]/20"
          data-testid="input-bpm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-3 block">
          Key
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateField("key", "")}
            data-testid="select-key-none"
            className={`px-3 py-1.5 rounded-md text-xs transition-all border ${
              form.key === ""
                ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]"
                : "border-border/50 bg-card text-muted-foreground hover:border-[var(--neon-cyan)]/30"
            }`}
          >
            —
          </button>
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => updateField("key", k)}
              data-testid={`select-key-${k}`}
              className={`px-3 py-1.5 rounded-md text-xs transition-all border ${
                form.key === k
                  ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] neon-glow-cyan"
                  : "border-border/50 bg-card text-foreground hover:border-[var(--neon-cyan)]/30"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-3 block">
          Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateField("mode", "")}
            data-testid="select-mode-none"
            className={`px-3 py-2 rounded-md text-xs text-left transition-all border ${
              form.mode === ""
                ? "border-[var(--neon-violet)] bg-[var(--neon-violet)]/10 text-[var(--neon-violet)]"
                : "border-border/50 bg-card text-muted-foreground hover:border-[var(--neon-violet)]/30"
            }`}
          >
            Not specified
          </button>
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => updateField("mode", m)}
              data-testid={`select-mode-${m}`}
              className={`px-3 py-2 rounded-md text-xs text-left transition-all border ${
                form.mode === m
                  ? "border-[var(--neon-violet)] bg-[var(--neon-violet)]/10 text-[var(--neon-violet)] neon-glow-violet"
                  : "border-border/50 bg-card text-foreground hover:border-[var(--neon-violet)]/30"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step6({
  form,
  updateField,
}: {
  form: FormState;
  updateField: (f: keyof FormState, v: any) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Personal observations, context, associations - everything you want to save about this track.
      </p>
      <Textarea
        value={form.notes}
        onChange={(e) => updateField("notes", e.target.value)}
        placeholder="Optional notes..."
        rows={6}
        className="bg-card border-border/50 focus:border-[var(--neon-pink)] focus:ring-[var(--neon-pink)]/20 resize-none"
        data-testid="input-notes"
      />
    </div>
  );
}
