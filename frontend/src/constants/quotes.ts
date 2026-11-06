/**
 * Speech-bubble dialogue for the guild: adventurers accepting and turning in
 * quests, saying goodbye, and the Guild Master's hand-out / receive lines.
 *
 * Lines are localized per UI language (src/i18n/quotes/*). Kept deliberately
 * short and few — every line should read like this world, not filler.
 */
import { usePreferencesStore } from "@/stores/preferencesStore";
import type { Locale } from "@/i18n";
import en from "@/i18n/quotes/en-quotes";
import es from "@/i18n/quotes/es-quotes";
import ptBR from "@/i18n/quotes/pt-BR-quotes";
import vi from "@/i18n/quotes/vi-quotes";
import type { QuoteSet } from "@/i18n/quotes/quote-set-type";

const QUOTES: Record<Locale, QuoteSet> = { en, es, "pt-BR": ptBR, vi };

/** Quote set for the current UI language (falls back to English). */
function currentQuotes(): QuoteSet {
  return QUOTES[usePreferencesStore.getState().language] ?? en;
}

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

function withName(line: string, name: string): string {
  return line.replaceAll("{name}", name);
}

export function getRandomWorkAcceptanceQuote(): string {
  return pick(currentQuotes().accept);
}

export function getRandomWorkCompletionQuote(): string {
  return pick(currentQuotes().complete);
}

export function getRandomFarewell(): string {
  return pick(currentQuotes().farewell);
}

/** Guild Master handing a quest to `name`. */
export function getQuestAssignLine(name: string): string {
  return withName(pick(currentQuotes().assign), name);
}

/** Guild Master receiving finished work from `name`. */
export function getQuestReceiveLine(name: string): string {
  return withName(pick(currentQuotes().receive), name);
}
