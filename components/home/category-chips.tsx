"use client";

import { useStore } from "@/lib/store";

export function CategoryChips({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const { categories } = useStore();

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-[24px] px-4 py-2 text-[13px] font-semibold transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "border border-border bg-card text-muted-foreground"
    }`;

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1">
      <button className={chip(value === null)} onClick={() => onChange(null)}>
        ທັງໝົດ
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          className={chip(value === c.slug)}
          onClick={() => onChange(c.slug)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
