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
    <Card className="min-h-40 p-5">
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-ember/10 text-ember shadow-sm">
          <Icon aria-hidden="true" size={21} />
          </span>
          <p className="text-sm font-extrabold text-bone">{title}</p>
        </div>
        <div>
          <p className="text-3xl font-black tracking-tight text-paper sm:text-4xl">{value}</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-smoke">{helper}</p>
        </div>
      </div>
    </Card>
  );
}
