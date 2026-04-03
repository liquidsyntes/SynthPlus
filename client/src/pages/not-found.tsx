import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold neon-text-pink">404</h1>
        <p className="text-muted-foreground">Страница не найдена</p>
        <Link href="/" className="text-sm text-[var(--neon-cyan)] hover:underline">
          На главную
        </Link>
      </div>
    </div>
  );
}
