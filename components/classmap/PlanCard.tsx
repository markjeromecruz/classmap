import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/types";

import { SUBJECT_COLORS, SUBJECT_LABELS, formatMinutes } from "./subject-meta";

export type PlanCardProps = {
  session: Session;
  className?: string;
};

export function PlanCard({ session, className }: PlanCardProps) {
  const colors = SUBJECT_COLORS[session.subject];

  return (
    <Card
      size="sm"
      data-slot="plan-card"
      data-subject={session.subject}
      className={cn("border-l-4 bg-card/60", colors.accent, className)}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge className={colors.badge}>
            {SUBJECT_LABELS[session.subject]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatMinutes(session.minutes)}
          </span>
        </div>
        <CardTitle>{session.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <CardDescription>{session.description}</CardDescription>
        {session.materials.length > 0 ? (
          <ul
            className="flex flex-wrap gap-1 pt-1"
            aria-label="Materials"
            data-slot="plan-card-materials"
          >
            {session.materials.map((m) => (
              <li key={m}>
                <Badge variant="outline" className="font-normal">
                  {m}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
