/**
 * ZoomControls Component
 *
 * Zoom in/out by whole pixel steps and reset the pixel camera (frame the
 * Guild Hall). The reset button shows the current zoom level.
 */

import { type ReactNode } from "react";
import { useCameraStore } from "@/stores/cameraStore";
import { maxPixelZoom, MIN_PIXEL_ZOOM } from "@/systems/pixelCamera";
import { useTranslation } from "@/hooks/useTranslation";

const BUTTON =
  "w-10 h-10 bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800/90 text-white rounded-lg flex items-center justify-center font-bold border border-slate-600 shadow-lg active:scale-95 transition-transform";

export function ZoomControls(): ReactNode {
  const pixelZoom = useCameraStore((s) => s.view?.pixelZoom ?? MIN_PIXEL_ZOOM);
  const maxZoom = useCameraStore((s) => maxPixelZoom(s.viewport?.dpr ?? 1));
  const zoomStep = useCameraStore((s) => s.zoomStep);
  const reset = useCameraStore((s) => s.reset);
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-14 right-4 flex flex-row gap-1 z-10">
      <button
        onClick={() => zoomStep(1)}
        disabled={pixelZoom >= maxZoom}
        className={`${BUTTON} text-xl`}
        aria-label={t("zoom.in")}
      >
        +
      </button>
      <button
        onClick={() => zoomStep(-1)}
        disabled={pixelZoom <= MIN_PIXEL_ZOOM}
        className={`${BUTTON} text-xl`}
        aria-label={t("zoom.out")}
      >
        −
      </button>
      <button onClick={reset} className={`${BUTTON} text-xs`} aria-label={t("zoom.reset")} title={t("zoom.reset")}>
        {pixelZoom}×
      </button>
    </div>
  );
}
