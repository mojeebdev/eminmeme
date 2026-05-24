import { v4 as uuidv4 } from "uuid";

const adjectives = [
  "hot", "wild", "based", "rogue", "spicy", "alpha", "sigma", "raw",
  "blazing", "cold", "viral", "rare", "peak", "main", "real", "true",
];

const nouns = [
  "bozo", "era", "szn", "arc", "run", "wave", "mode", "vibe",
  "heat", "fire", "drip", "grind", "flex", "move", "play", "drop",
];

export function generateSlug(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const uid = uuidv4().split("-")[0];
  return `emin-${adj}-${noun}-${uid}`;
}
