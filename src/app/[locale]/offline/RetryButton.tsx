"use client";

import Button from "@/components/ui/Button/Button";

export default function RetryButton({ label }: { label: string }) {
  return <Button onClick={() => window.location.reload()}>{label}</Button>;
}
