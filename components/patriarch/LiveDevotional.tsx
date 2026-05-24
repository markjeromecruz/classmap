"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE_BASE_PATH } from "@/lib/env";
import { devotionalSchema, type Devotional } from "@/lib/patriarch-types";

import { DevotionalView } from "./DevotionalView";

type Status = "loading" | "success" | "error";

export function LiveDevotional() {
  const [status, setStatus] = useState<Status>("loading");
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${SITE_BASE_PATH}/patriarch/api/devotional`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          },
        );
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        const json = await res.json();
        const parsed = devotionalSchema.safeParse(json);
        if (!parsed.success) {
          throw new Error("Response did not match Devotional schema");
        }
        if (!cancelled) {
          setDevotional(parsed.data);
          setStatus("success");
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div
        data-slot="devotional-loading"
        aria-busy
        aria-live="polite"
        className="max-w-2xl mx-auto space-y-4"
      >
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-10 w-1/2 mx-auto" />
        <Skeleton className="h-32 w-full mt-8" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <Alert
        variant="destructive"
        data-slot="devotional-error"
        className="max-w-2xl mx-auto"
      >
        <AlertTitle>Couldn&rsquo;t fetch today&rsquo;s devotional.</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (devotional) return <DevotionalView devotional={devotional} />;
  return null;
}
