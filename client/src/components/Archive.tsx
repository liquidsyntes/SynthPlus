import { useState, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Track } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  PlusCircle,
  Search,
  X,
  Disc3,
  Heart,
  Music,
} from "lucide-react";
import { SUBGENRES, MOODS } from "@/lib/constants";

interface ArchiveProps {
  tracks: Track[];
  isLoading: boolean;
  onViewTrack: (track: Track) => void;
  onNewTrack: () => void;
}

export function Archive({ tracks, isLoading, onViewTrack, onNewTrack }: ArchiveProps) {
  const [filterSubgenre, setFilterSubgenre] = useState("");
  const [filterMood, setFilterMood] = useState("");
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const res = await apiRequest("POST", "/api/tracks/import", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
    },
  });

  const filteredTracks = tracks.filter((t) => {
    if (filterSubgenre && t.mainSubgenre !== filterSubgenre) return false;
    if (filterMood && t.mainMood !== filterMood) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !t.name.toLowerCase().includes(s) &&
        !t.artist.toLowerCase().includes(s)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleExportJSON = useCallback(async () => {
    try {
      const res = await apiRequest("GET", "/api/tracks/export/json");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "synthwave-archive.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    }
  }, []);

  const handleImportJSON = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target?.result as string);
          if (Array.isArray(data)) {
            importMutation.mutate(data);
          }
        } catch (err) {
          console.error("Invalid JSON file:", err);
        }
      };
      reader.readAsText(file);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [importMutation]
  );

  const hasFilters = filterSubgenre || filterMood || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Archive</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJSON}
            disabled={tracks.length === 0}
            className="border-border/50 text-foreground text-xs"
            data-testid="button-export-json"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-border/50 text-foreground text-xs"
            data-testid="button-import-json"
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or artist..."
            className="w-full pl-9 pr-8 py-2 rounded-md text-xs bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--neon-pink)]/50"
            data-testid="input-search"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterSubgenre}
            onChange={(e) => setFilterSubgenre(e.target.value)}
            className="px-3 py-1.5 rounded-md text-xs bg-card border border-border/50 text-foreground focus:outline-none focus:border-[var(--neon-pink)]/50 appearance-none cursor-pointer"
            data-testid="filter-subgenre"
          >
            <option value="">All subgenres</option>
            {SUBGENRES.map((sg) => (
              <option key={sg} value={sg}>
                {sg}
              </option>
            ))}
          </select>
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className="px-3 py-1.5 rounded-md text-xs bg-card border border-border/50 text-foreground focus:outline-none focus:border-[var(--neon-violet)]/50 appearance-none cursor-pointer"
            data-testid="filter-mood"
          >
            <option value="">All moods</option>
            {MOODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => {
                setFilterSubgenre("");
                setFilterMood("");
                setSearch("");
              }}
              className="px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground"
              data-testid="button-clear-filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Track grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-lg bg-card animate-pulse border border-border/30"
            />
          ))}
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Music className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <div>
            <p className="text-sm text-muted-foreground">
              {tracks.length === 0
                ? "Archive is empty"
                : "Nothing found"}
            </p>
            {tracks.length === 0 && (
              <Button
                size="sm"
                onClick={onNewTrack}
                className="mt-3 bg-[var(--neon-pink)] hover:bg-[var(--neon-pink)]/80 text-white"
                data-testid="button-create-first"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Create first track
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTracks.map((track) => {
            const vectorColor =
              track.vector === "Bright"
                ? "var(--neon-cyan)"
                : track.vector === "Dark"
                ? "var(--neon-pink)"
                : "var(--neon-violet)";

            return (
              <button
                key={track.id}
                onClick={() => onViewTrack(track)}
                className="text-left p-4 rounded-lg border border-border/50 bg-card hover:border-[var(--neon-pink)]/30 transition-all duration-200 group relative overflow-hidden"
                data-testid={`card-track-${track.id}`}
              >
                {/* Top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, var(--neon-pink), ${vectorColor})`,
                  }}
                />

                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-[var(--neon-pink)] transition-colors">
                      {track.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artist}
                      {track.year && ` (${track.year})`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-[var(--neon-pink)]/20 bg-[var(--neon-pink)]/5 text-[var(--neon-pink)]">
                      <Disc3 className="w-2.5 h-2.5" />
                      {track.mainSubgenre}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-[var(--neon-violet)]/20 bg-[var(--neon-violet)]/5 text-[var(--neon-violet)]">
                      <Heart className="w-2.5 h-2.5" />
                      {track.mainMood}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        color: vectorColor,
                        backgroundColor: `color-mix(in srgb, ${vectorColor} 8%, transparent)`,
                      }}
                    >
                      {track.vector}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {filteredTracks.length > 0 && (
        <p className="text-center text-[10px] text-muted-foreground/50">
          {filteredTracks.length} of {tracks.length} tracks
        </p>
      )}
    </div>
  );
}
