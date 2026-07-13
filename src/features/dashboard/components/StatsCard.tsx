import type { LucideIcon } from "lucide-react";

import { Card } from "../../../shared/components/Card";

type StatsCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
};

export function StatsCard({ title, value, helper, icon: Icon }: StatsCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-bone">{title}</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-paper">{value}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-smoke">{helper}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-md bg-flame/30 text-ember shadow-sm">
          <Icon aria-hidden="true" size={21} />
        </span>
      </div>
    </Card>
  );
}
