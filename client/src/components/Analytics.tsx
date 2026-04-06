import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Activity, Music, PieChart as PieChartIcon } from "lucide-react";
import type { Track } from "@shared/schema";

interface AnalyticsProps {
  tracks: Track[];
}

const COLORS = ['#FF00FF', '#00FFFF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

export function Analytics({ tracks }: AnalyticsProps) {
  const genreData = useMemo(() => {
    const counts = tracks.reduce((acc, t) => {
      acc[t.mainSubgenre] = (acc[t.mainSubgenre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [tracks]);

  const moodData = useMemo(() => {
    const counts = tracks.reduce((acc, t) => {
      acc[t.mainMood] = (acc[t.mainMood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [tracks]);

  const averageBpm = useMemo(() => {
    const tracksWithBpm = tracks.filter(t => t.bpm && !isNaN(Number(t.bpm)));
    if (tracksWithBpm.length === 0) return 0;
    const sum = tracksWithBpm.reduce((acc, t) => acc + Number(t.bpm), 0);
    return Math.round(sum / tracksWithBpm.length);
  }, [tracks]);

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PieChartIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-bold mb-2 text-foreground">Нет данных для анализа</h3>
        <p className="text-muted-foreground">Добавьте несколько треков в архив, чтобы увидеть статистику.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <Music className="w-8 h-8 text-[var(--neon-pink)] mb-2" />
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Всего треков</h4>
          <span className="text-3xl font-bold text-foreground mt-1">{tracks.length}</span>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <Activity className="w-8 h-8 text-[var(--neon-cyan)] mb-2" />
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Средний BPM</h4>
          <span className="text-3xl font-bold text-foreground mt-1">{averageBpm || "--"}</span>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <PieChartIcon className="w-8 h-8 text-purple-400 mb-2" />
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Топ жанр</h4>
          <span className="text-xl font-bold text-foreground mt-1">
            {genreData.length > 0 ? genreData[0].name : "--"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--neon-pink)]" />
            Распределение по жанрам
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value) => [value, "Треков"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--neon-cyan)]" />
            Настроения треков
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  formatter={(value) => [value, "Треков"]}
                />
                <Bar dataKey="value" fill="var(--neon-cyan)" radius={[0, 4, 4, 0]}>
                  {moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
