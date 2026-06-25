"use client";

import { categoryLabels, categoryOrder, getTracksByCategory } from "@/lib/curriculum";
import { TrackCard } from "@/components/curriculum/track-card";

const liveTrackId = "html-css";

type TrackGridProps = {
  selectedTrackIds: string[];
  onToggleTrack: (trackId: string) => void;
};

export function TrackGrid({ selectedTrackIds, onToggleTrack }: TrackGridProps) {
  return (
    <div className="space-y-7">
      {categoryOrder.map((category) => (
        <section key={category} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-duo-eel">
              {categoryLabels[category]}
            </h2>
            <span className="rounded-full bg-duo-grey-panel px-3 py-1 text-xs font-black text-duo-grey-disabled">
              {getTracksByCategory(category).length} tracks
            </span>
          </div>
          <div className="grid max-w-xl gap-3">
            {getTracksByCategory(category).map((track) => {
              const locked = track.id !== liveTrackId;

              return (
                <TrackCard
                  key={track.id}
                  locked={locked}
                  onClick={locked ? undefined : () => onToggleTrack(track.id)}
                  selected={selectedTrackIds.includes(track.id)}
                  track={track}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
