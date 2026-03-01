"use client";

import { UserButton } from "@clerk/nextjs";

type DashboardHeaderProps = {
  nextMeetingLabel: string;
};

export function DashboardHeader({ nextMeetingLabel }: DashboardHeaderProps) {
  return (
    <header className="rounded-2xl border border-black/10 bg-white/75 p-5 backdrop-blur-sm md:p-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-black/55">Pensatori Meet</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black md:text-4xl">
            Meetings for staff and clients
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-black/70">
            Create instant or scheduled sessions, generate invitation links, and let guests join
            without Clerk sign-in.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-black/70">
            {nextMeetingLabel}
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
