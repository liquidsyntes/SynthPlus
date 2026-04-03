import { useRef, useCallback, useState } from "react";
import type { Track } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Download,
  ArrowLeft,
  Trash2,
  ExternalLink,
  Music,
  Disc3,
  Heart,
  Gauge,
  StickyNote,
  Loader2,
  Wand2,
  FileText,
  RefreshCw,
  Activity,
} from "lucide-react";
import { SUBGENRE_QUESTIONS, MOOD_QUESTIONS, getDynamicQuestions } from "@/lib/constants";

function generateAIPrompt(data: any): string {
  const parts: string[] = [];
  
  if (data.mainSubgenre) parts.push(`Genre: ${data.mainSubgenre}`);
  if (data.adjacentSubgenre) parts.push(`Influences: ${data.adjacentSubgenre}`);
  if (data.vector) parts.push(`Vibe/Vector: ${data.vector} (synthwave)`);
  if (data.mainMood) parts.push(`Main Mood: ${data.mainMood}`);
  if (data.secondaryMoods?.length) parts.push(`Additional Moods: ${data.secondaryMoods.join(", ")}`);
  
  if (data.bpm) parts.push(`Tempo: ${data.bpm} BPM`);
  if (data.key) parts.push(`Key: ${data.key}`);
  if (data.mode) parts.push(`Mode: ${data.mode}`);
  
  const dynKeys = Object.keys(data.dynamicAnswers || {});
  if (dynKeys.length > 0) {
    const dynParts = dynKeys.map(k => `${qKeyToText(k)}: ${data.dynamicAnswers[k]}`);
    parts.push(`Characteristics: ${dynParts.join(", ")}`);
  }
  
  if (data.notes) parts.push(`Notes: ${data.notes}`);

  return `Create a high-quality synthwave track with the following parameters:\n\n${parts.join("\n")}\n\nThe style should be immersive.`;
}

function qKeyToText(key: string): string {
  // Try to map dynamic answer keys back if needed, but here we just use the key directly
  return key.replace(/_/g, ' ');
}

interface TrackCardProps {
  track: Track | null;
  formData: any | null;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
  onBack: () => void;
  onDelete?: () => void;
}

function getTrackData(track: Track | null, formData: any) {
  if (track) {
    return {
      name: track.name,
      artist: track.artist,
      year: track.year,
      link: track.link,
      mainSubgenre: track.mainSubgenre,
      adjacentSubgenre: track.adjacentSubgenre,
      mainMood: track.mainMood,
      secondaryMoods: track.secondaryMoods ? JSON.parse(track.secondaryMoods) : [],
      vector: track.vector,
      dynamicAnswers: track.dynamicAnswers ? JSON.parse(track.dynamicAnswers) : {},
      bpm: track.bpm,
      key: track.key,
      mode: track.mode,
      notes: track.notes,
    };
  }
  if (formData) {
    return {
      name: formData.name,
      artist: formData.artist,
      year: formData.year,
      link: formData.link,
      mainSubgenre: formData.mainSubgenre,
      adjacentSubgenre: formData.adjacentSubgenre,
      mainMood: formData.mainMood,
      secondaryMoods: formData.secondaryMoods ? JSON.parse(formData.secondaryMoods) : [],
      vector: formData.vector,
      dynamicAnswers: formData.dynamicAnswers ? JSON.parse(formData.dynamicAnswers) : {},
      bpm: formData.bpm,
      key: formData.key,
      mode: formData.mode,
      notes: formData.notes,
    };
  }
  return null;
}

export function TrackCard({
  track,
  formData,
  onSave,
  isSaving,
  isSaved,
  onBack,
  onDelete,
}: TrackCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const data = getTrackData(track, formData);
  if (!data) return null;

  const vectorColor =
    data.vector === "Bright"
      ? "text-[var(--neon-cyan)] shadow-[0_0_10px_rgba(0,255,255,0.3)]"
      : data.vector === "Dark"
      ? "text-[var(--neon-pink)] shadow-[0_0_10px_rgba(255,0,255,0.3)]"
      : "text-[var(--neon-violet)] shadow-[0_0_10px_rgba(138,43,226,0.3)]";

  const handleExportPNG = useCallback(async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = async () => {
      const html2canvas = (window as any).html2canvas;
      const canvas = await html2canvas(cardRef.current!, {
        backgroundColor: "#0a0a14",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `${data.name} - ${data.artist}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsExporting(false);
    };
    document.head.appendChild(script);
  }, [data]);

  const handleExportPDF = useCallback(async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    const loadScript = (src: string) => new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      document.head.appendChild(script);
    });

    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

    const html2canvas = (window as any).html2canvas;
    const jsPDF = (window as any).jspdf.jsPDF;
    const canvas = await html2canvas(cardRef.current!, { backgroundColor: "#0a0a14", scale: 2 });
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${data.name} - ${data.artist}.pdf`);
    setIsExporting(false);
  }, [data]);

  const handleCopyPrompt = useCallback(() => {
    if (!data) return;
    const prompt = generateAIPrompt(data);
    navigator.clipboard.writeText(prompt).then(() => {
      toast({
        title: "Prompt copied",
        description: "Prompt text copied to clipboard.",
        className: "bg-black border-[var(--neon-pink)] text-white",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy prompt. Select text and copy manually.",
        variant: "destructive",
      });
    });
  }, [data, toast]);

  const dynamicQuestions = getDynamicQuestions(data.mainSubgenre, data.mainMood, data.secondaryMoods);
  const characteristics = dynamicQuestions
    .filter(q => data.dynamicAnswers[q.id] !== undefined)
    .map(q => ({ q, display: data.dynamicAnswers[q.id] }));

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          New Track
        </Button>
        <div className="flex gap-2">
          {!isSaved && (
            <Button onClick={onSave} disabled={isSaving} className="bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-black">
              {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          )}
          <Button variant="outline" onClick={handleCopyPrompt} className="border-border/50 text-foreground hover:border-[var(--neon-violet)] hover:text-white">
            <Wand2 className="w-4 h-4 mr-2" />
            Prompt
          </Button>
          <Button variant="outline" onClick={handleExportPNG} disabled={isExporting} className="border-border/50 text-foreground">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={isExporting} className="border-border/50 text-foreground">
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div ref={cardRef} className="relative rounded-xl border border-white/10 bg-[#0a0a14] p-8 overflow-hidden" data-testid="track-card">
        {isSaved && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs border border-white/10 text-muted-foreground flex items-center gap-1.5">
            ✓ Saved to archive
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{data.name}</h2>
            <p className="text-lg text-muted-foreground">{data.artist} {data.year && `• ${data.year}`}</p>
            {data.link && (
              <div className="flex items-center gap-2 text-sm mt-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-[var(--neon-cyan)] hover:underline truncate">
                  {data.link.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-pink)]"></span>
                Subgenre
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-[var(--neon-pink)]/50 text-[var(--neon-pink)]">{data.mainSubgenre}</Badge>
                {data.adjacentSubgenre && <Badge variant="outline" className="border-border text-muted-foreground">{data.adjacentSubgenre}</Badge>}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-violet)]"></span>
                Mood
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-[var(--neon-violet)]/50 text-[var(--neon-violet)]">{data.mainMood}</Badge>
                {data.secondaryMoods.map((m: string) => <Badge key={m} variant="outline" className="border-border text-muted-foreground">{m}</Badge>)}
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              {characteristics.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)]"></span>
                    Characteristics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {characteristics.map(({ q, display }) => (
                      <div key={q.id} className="text-sm">
                        <span className="text-muted-foreground block text-xs">{q.text}</span>
                        <span className="text-foreground">{display}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-[240px] shrink-0 space-y-4">
              {(data.bpm || data.key || data.mode) && (
                <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/5">
                  <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-[var(--neon-cyan)]" />
                    Parameters
                  </h4>
                  <div className="space-y-2 text-xs">
                    {data.bpm && <div><span className="text-muted-foreground">BPM:</span> <span className="text-[var(--neon-cyan)]">{data.bpm}</span></div>}
                    {data.key && <div><span className="text-muted-foreground">Key:</span> {data.key}</div>}
                    {data.mode && <div><span className="text-muted-foreground">Mode:</span> {data.mode}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {data.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Notes
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic" data-testid="text-notes">
                {data.notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/50">
              <span>SynthPassport</span>
              <span>synthwave track passport</span>
            </div>
          </div>
        </div>
      </div>

      {isSaved && (
        <p className="text-center text-xs text-muted-foreground">
          ✓ Saved to archive
        </p>
      )}
    </div>
  );
}
