import { afterEach, describe, expect, it } from "vitest";
import {
  getQuestAssignLine,
  getQuestReceiveLine,
  getRandomFarewell,
  getRandomWorkAcceptanceQuote,
  getRandomWorkCompletionQuote,
} from "@/constants/quotes";
import { locales, type Locale } from "@/i18n";
import en from "@/i18n/quotes/en-quotes";
import es from "@/i18n/quotes/es-quotes";
import ptBR from "@/i18n/quotes/pt-BR-quotes";
import vi from "@/i18n/quotes/vi-quotes";
import type { QuoteSet } from "@/i18n/quotes/quote-set-type";
import { usePreferencesStore } from "@/stores/preferencesStore";

const SETS: Record<Locale, QuoteSet> = { en, es, "pt-BR": ptBR, vi };

describe("dungeon quotes", () => {
  afterEach(() => usePreferencesStore.setState({ language: "en" }));

  it("has a quote set for every UI locale, with no empty lists", () => {
    for (const locale of Object.keys(locales) as Locale[]) {
      const set = SETS[locale];
      expect(set, locale).toBeDefined();
      for (const lines of Object.values(set)) {
        expect(lines.length).toBeGreaterThan(0);
        lines.forEach((l: string) => expect(l.trim().length).toBeGreaterThan(0));
      }
    }
  });

  it("Guild Master lines always name the agent", () => {
    for (const set of Object.values(SETS)) {
      [...set.assign, ...set.receive].forEach((l) => expect(l).toContain("{name}"));
    }
    expect(getQuestAssignLine("Alice")).toContain("Alice");
    expect(getQuestReceiveLine("Bob")).toContain("Bob");
    expect(getQuestAssignLine("Alice")).not.toContain("{name}");
  });

  it("follows the UI language", () => {
    usePreferencesStore.setState({ language: "vi" });
    expect(vi.accept).toContain(getRandomWorkAcceptanceQuote());
    expect(vi.complete).toContain(getRandomWorkCompletionQuote());
    expect(vi.farewell).toContain(getRandomFarewell());
    usePreferencesStore.setState({ language: "es" });
    expect(es.accept).toContain(getRandomWorkAcceptanceQuote());
  });
});
