"use client";

/**
 * Entry menu for choosing the visual theme.
 *
 * Shown automatically on first launch (no theme saved yet) and reopened from
 * the header. Each option shows a real preview of its world — the office as
 * it renders today, the dungeon as a live canvas drawn from the CC0 tileset —
 * so the choice is made on what the user will actually see.
 *
 * Keyboard: arrow keys move between options, Enter confirms, Escape closes
 * (only when a theme was already chosen, so first launch always ends in a pick).
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { getThemeManifest } from "@/themes/theme-registry";
import { THEME_IDS, type ThemeId } from "@/themes/theme-types";
import DungeonThemePreviewCanvas from "./DungeonThemePreviewCanvas";

interface ThemePickerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const OFFICE_PREVIEW_IMAGE = "/themes/office-theme-preview.png";

export default function ThemePickerMenu({ isOpen, onClose }: ThemePickerMenuProps) {
  // Mounting the content only while open resets its state on every opening.
  if (!isOpen) return null;
  return <ThemePickerMenuContent onClose={onClose} />;
}

function ThemePickerMenuContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const theme = usePreferencesStore((s) => s.theme);
  const themeChosen = usePreferencesStore((s) => s.themeChosen);
  const setTheme = usePreferencesStore((s) => s.setTheme);

  // Start from the active theme each time the menu opens.
  const [pending, setPending] = useState<ThemeId>(theme);
  const optionRefs = useRef<Record<ThemeId, HTMLButtonElement | null>>({
    office: null,
    dungeon: null,
  });
  const initialThemeRef = useRef(theme);

  // Move keyboard focus onto the selected option when the menu appears.
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      optionRefs.current[initialThemeRef.current]?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  const pendingName = t(getThemeManifest(pending).nameKey);

  const select = (id: ThemeId) => {
    setPending(id);
    optionRefs.current[id]?.focus({ preventScroll: true });
  };

  const confirm = () => {
    void setTheme(pending);
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = THEME_IDS.indexOf(pending);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      select(THEME_IDS[(index + 1) % THEME_IDS.length]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      select(THEME_IDS[(index - 1 + THEME_IDS.length) % THEME_IDS.length]);
    } else if (e.key === "Enter") {
      e.preventDefault();
      confirm();
    } else if (e.key === "Escape" && themeChosen) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950 text-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-picker-title"
      onKeyDown={onKeyDown}
    >
      <div className="mx-auto flex min-h-full max-w-6xl flex-col px-6 py-8 md:px-10 md:py-12">
        <p className="text-xl font-bold tracking-tight">
          <span className="text-orange-500">Claude</span> {t("app.title")}
        </p>

        <h2
          id="theme-picker-title"
          className="mt-10 text-3xl font-bold leading-tight tracking-tight md:mt-14 md:text-5xl"
        >
          {t("theme.picker.title")}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
          {t("theme.picker.subtitle")}
        </p>

        <div
          role="radiogroup"
          aria-labelledby="theme-picker-title"
          className="mt-10 grid flex-1 grid-cols-1 gap-6 md:mt-12 md:grid-cols-2 md:gap-8"
        >
          {THEME_IDS.map((id) => {
            const manifest = getThemeManifest(id);
            const selected = pending === id;
            return (
              <button
                key={id}
                ref={(el) => {
                  optionRefs.current[id] = el;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setPending(id)}
                onDoubleClick={confirm}
                className={`flex flex-col bg-slate-900 p-3 text-left outline transition-[outline-color,outline-offset] duration-150 focus-visible:outline-offset-4 ${
                  selected
                    ? "outline-2 outline-orange-500"
                    : "outline-1 outline-slate-800 hover:outline-slate-600"
                }`}
              >
                <div className="aspect-[3/2] w-full overflow-hidden bg-black">
                  {id === "dungeon" ? (
                    <DungeonThemePreviewCanvas
                      label={t("theme.dungeon.previewAlt")}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- static local preview, no optimization needed
                    <img
                      src={OFFICE_PREVIEW_IMAGE}
                      alt={t("theme.office.previewAlt")}
                      className="h-full w-full object-cover object-[52%_45%]"
                    />
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-4 px-1 pt-5">
                  <span className="text-2xl font-bold tracking-tight">
                    {t(manifest.nameKey)}
                  </span>
                  {themeChosen && theme === id && (
                    <span className="text-sm text-slate-400">{t("theme.picker.current")}</span>
                  )}
                </div>
                <span className="mt-2 px-1 text-base leading-relaxed text-slate-200">
                  {t(manifest.descriptionKey)}
                </span>
                {id === "dungeon" && (
                  <span className="mt-3 px-1 pb-1 text-sm text-slate-400">
                    {t("theme.dungeon.earlyPreview")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col-reverse items-stretch gap-4 md:flex-row md:items-center md:justify-between">
          <p className="hidden text-sm text-slate-400 md:block">{t("theme.picker.keyboardHint")}</p>
          <div className="flex gap-3">
            {themeChosen && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 text-base font-semibold text-slate-300 transition-colors hover:bg-slate-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                {t("modal.close")}
              </button>
            )}
            <button
              type="button"
              onClick={confirm}
              className="flex-1 bg-orange-500 px-6 py-3 text-base font-bold text-slate-950 transition-colors hover:bg-orange-400 active:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:flex-none"
            >
              {t("theme.picker.enter", { name: pendingName })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
