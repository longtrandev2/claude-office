/**
 * ZoneNavigationHints
 *
 * Edge signposts over the scene: for each direction that has a neighbouring
 * room, an arrow + the room's name ("Library →"). They follow the room the
 * camera is on, mirror the arrow keys, and are clickable.
 */
"use client";

import { type ReactNode } from "react";
import { useCameraStore, currentZoneId } from "@/stores/cameraStore";
import { neighborZone, type ZoneDirection } from "@/dungeon/world-zone-navigation";
import { useTranslation } from "@/hooks/useTranslation";

const HINTS: { direction: ZoneDirection; arrow: string; className: string }[] = [
  { direction: "left", arrow: "←", className: "zone-hint--left" },
  { direction: "right", arrow: "→", className: "zone-hint--right" },
  { direction: "up", arrow: "↑", className: "zone-hint--up" },
  { direction: "down", arrow: "↓", className: "zone-hint--down" },
];

export function ZoneNavigationHints(): ReactNode {
  const { t } = useTranslation();
  const from = useCameraStore(currentZoneId);
  const stepZone = useCameraStore((s) => s.stepZone);
  if (!from) return null;

  return (
    <nav className="zone-hints" aria-label={t("zone.navigation")}>
      {HINTS.map(({ direction, arrow, className }) => {
        const target = neighborZone(from, direction);
        if (!target) return null;
        const name = t(target.nameKey);
        const arrowFirst = direction === "left" || direction === "up";
        return (
          <button
            key={direction}
            type="button"
            className={`zone-hint ${className}`}
            onClick={() => stepZone(direction)}
            title={name}
          >
            {arrowFirst && <span className="zone-hint__arrow">{arrow}</span>}
            <span>{name}</span>
            {!arrowFirst && <span className="zone-hint__arrow">{arrow}</span>}
          </button>
        );
      })}
    </nav>
  );
}
