const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "have",
  "this",
  "from",
  "your",
  "will",
  "into",
  "about",
  "such",
  "their",
  "would",
  "there",
  "other",
  "which",
  "should",
  "could",
  "while",
  "where",
  "within",
  "using",
  "these",
  "those",
  "over",
  "more",
  "than",
  "when",
  "able",
  "least",
  "well",
  "must",
  "also",
  "both",
  "each",
  "high",
  "very",
  "like",
  "into",
  "make",
  "made",
  "through",
]);

const WORD_PATTERN = /[A-Za-z0-9]+/g;

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9\s]/g, " ");
}

export function extractKeywords(text: string, limit = 40): string[] {
  if (!text) {
    return [];
  }

  const normalized = normalize(text);
  const matches = normalized.match(WORD_PATTERN);

  if (!matches) {
    return [];
  }

  const keywords = new Set<string>();

  for (const word of matches) {
    if (word.length < 4) {
      continue;
    }

    if (STOP_WORDS.has(word)) {
      continue;
    }

    keywords.add(word);

    if (keywords.size >= limit) {
      break;
    }
  }

  return Array.from(keywords);
}

export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
