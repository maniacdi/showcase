"use client";

import { type ReactNode } from "react";
import Button from "@/components/ui/Button/Button";
import { useBudgetStore } from "@/store/useBudgetStore";

type Variant = "solid" | "outline" | "ghost";

export default function BudgetButton({
  plan = null,
  variant = "solid",
  className,
  children,
}: {
  plan?: string | null;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  const openWith = useBudgetStore((s) => s.openWith);
  return (
    <Button variant={variant} className={className} onClick={() => openWith(plan)}>
      {children}
    </Button>
  );
}
