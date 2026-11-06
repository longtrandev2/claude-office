import type { QuoteSet } from "./quote-set-type";

/** Adventurer dialogue (en). `{name}` is replaced with the agent's name. */
const en: QuoteSet = {
  accept: [
    "On my way.",
    "Consider it done.",
    "Quest accepted.",
    "I'll take the left tunnel.",
    "Lead on.",
    "Sharpening my blade.",
    "Map's already in my pack.",
    "Back before the torches gutter.",
    "Leave it to me.",
    "Right away, Master.",
    "I know these halls.",
    "Say no more.",
    "Into the dark, then.",
    "Already packing.",
  ],
  complete: [
    "Quest complete.",
    "Done. Not a scratch.",
    "Here's the loot.",
    "Cleared and mapped.",
    "It held. Barely.",
    "Back with the goods.",
    "All accounted for.",
    "Ready for inspection.",
    "The tunnel's clear.",
    "Sealed and delivered.",
    "Found it where you said.",
    "Report's on the table.",
    "That one fought back.",
    "Done, and the map's updated.",
  ],
  farewell: [
    "Back to the tavern.",
    "Until the next quest.",
    "The torch is yours.",
    "Off to rest my feet.",
    "Call me if the walls move.",
    "See you topside.",
    "Good hunting.",
    "I'll be by the fire.",
    "Keep the lights on.",
    "Farewell, Master.",
  ],
  assign: [
    "Your quest, {name}.",
    "Take this one, {name}.",
    "{name}, you're up.",
  ],
  receive: [
    "Well done, {name}.",
    "Good work, {name}. I'll take it.",
    "Fine work, {name}.",
  ],
};

export default en;
