/** Dialogue lines shown in speech bubbles, per locale. */
export interface QuoteSet {
  /** Adventurer accepting a quest from the Guild Master. */
  accept: string[];
  /** Adventurer turning in finished work. */
  complete: string[];
  /** Adventurer leaving through the portal. */
  farewell: string[];
  /** Guild Master handing out a quest; contains `{name}`. */
  assign: string[];
  /** Guild Master receiving finished work; contains `{name}`. */
  receive: string[];
}
