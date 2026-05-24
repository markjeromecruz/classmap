import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

type Status = "live" | "in-progress" | "coming-soon";

const statusLabel: Record<Status, string> = {
  live: "Live demo",
  "in-progress": "In progress",
  "coming-soon": "Coming soon",
};

const statusClass: Record<Status, string> = {
  live: "text-emerald-600 dark:text-emerald-400",
  "in-progress": "text-amber-600 dark:text-amber-400",
  "coming-soon": "text-muted-foreground",
};

interface AppCardProps {
  title: string;
  tagline: string;
  description: string;
  href?: string;
  status: Status;
  highlights: string[];
}

export function AppCard({
  title,
  tagline,
  description,
  href,
  status,
  highlights,
}: AppCardProps) {
  const interactive = status === "live" && href;

  const body = (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {tagline}
            </p>
          </div>
          <span
            className={`text-xs font-medium uppercase tracking-wide ${statusClass[status]}`}
          >
            {statusLabel[status]}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          {highlights.map((h) => (
            <li key={h} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 size-1.5 rounded-full bg-foreground/40 shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      {interactive ? (
        <CardFooter>
          <span className="text-sm font-medium text-foreground">
            Open demo →
          </span>
        </CardFooter>
      ) : null}
    </Card>
  );

  if (interactive) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {body}
      </Link>
    );
  }
  return <div aria-disabled className="opacity-80">{body}</div>;
}
