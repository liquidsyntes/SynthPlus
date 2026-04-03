import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Track } from "@shared/schema";
import { TrackForm } from "@/components/TrackForm";
import { TrackCard } from "@/components/TrackCard";
import { Archive } from "@/components/Archive";
import { Music, PlusCircle, Archive as ArchiveIcon } from "lucide-react";

type Screen = "form" | "card" | "archive";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("form");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const { data: tracks = [], isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tracks", data);
      return res.json();
    },
    onSuccess: (track: Track) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      setCurrentTrack(track);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tracks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      setCurrentTrack(null);
      setScreen("archive");
    },
  });

  const handleFormComplete = useCallback((data: any) => {
    setFormData(data);
    setScreen("card");
  }, []);

  const handleSaveToArchive = useCallback(async () => {
    if (!formData) return;
    await saveMutation.mutateAsync(formData);
  }, [formData, saveMutation]);

  const handleViewTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setFormData(null);
    setScreen("card");
  }, []);

  const handleNewTrack = useCallback(() => {
    setCurrentTrack(null);
    setFormData(null);
    setScreen("form");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleNewTrack}
            className="flex items-center gap-2 group"
            data-testid="link-home"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--neon-pink)]/10 group-hover:bg-[var(--neon-pink)]/20 transition-colors">
              <Music className="w-4 h-4 text-[var(--neon-pink)]" />
            </div>
            <span className="font-semibold text-sm tracking-wide">
              <span className="neon-text-pink">Synth</span>
              <span className="text-foreground">Passport</span>
            </span>
          </button>
          <nav className="flex items-center gap-1">
            <button
              onClick={handleNewTrack}
              data-testid="button-new-track"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                screen === "form"
                  ? "bg-[var(--neon-pink)]/10 text-[var(--neon-pink)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Новый трек
            </button>
            <button
              onClick={() => setScreen("archive")}
              data-testid="button-archive"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                screen === "archive"
                  ? "bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArchiveIcon className="w-3.5 h-3.5" />
              Архив
              {tracks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]">
                  {tracks.length}
                </span>
              )}
            </button>
          </nav>
        </div>
        <div className="neon-line" />
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {screen === "form" && (
          <TrackForm onComplete={handleFormComplete} />
        )}
        {screen === "card" && (
          <TrackCard
            track={currentTrack}
            formData={formData}
            onSave={handleSaveToArchive}
            isSaving={saveMutation.isPending}
            isSaved={!!currentTrack}
            onBack={handleNewTrack}
            onDelete={currentTrack ? () => deleteMutation.mutate(currentTrack.id) : undefined}
          />
        )}
        {screen === "archive" && (
          <Archive
            tracks={tracks}
            isLoading={isLoading}
            onViewTrack={handleViewTrack}
            onNewTrack={handleNewTrack}
          />
        )}
      </main>
    </div>
  );
}
