import { tokenize } from './tokenizer';
import { levenshtein } from './levenshtein';

/** Max Levenshtein distance allowed by query token length (reduces false positives on short tokens). */
function maxDistanceForQueryToken(queryToken: string): number {
  const len = queryToken.length;
  if (len <= 2) return 0;
  if (len <= 4) return 1;
  return 2;
}

export class TokenDictionary {
  private tokens: Set<string> = new Set();
  private tokenFrequency: Map<string, number> = new Map();

  private recordToken(t: string): void {
    if (!t) return;
    this.tokens.add(t);
    this.tokenFrequency.set(t, (this.tokenFrequency.get(t) ?? 0) + 1);
  }

  /**
   * Builds vocabulary from product text so typo correction can map queries like "wirelss" → "wireless"
   * even when the word appears only in descriptions (not only names/tags).
   */
  build(
    productNames: string[],
    productTagsList: string[][],
    descriptions: string[],
    categories: string[],
  ): void {
    this.tokens.clear();
    this.tokenFrequency.clear();

    for (const name of productNames) {
      for (const t of tokenize(name)) this.recordToken(t);
    }
    for (const tags of productTagsList) {
      for (const tag of tags) {
        for (const t of tokenize(tag)) this.recordToken(t);
      }
    }
    for (const desc of descriptions) {
      for (const t of tokenize(desc)) this.recordToken(t);
    }
    for (const cat of categories) {
      for (const t of tokenize(cat)) this.recordToken(t);
    }
  }

  /**
   * Returns a corrected token when within edit distance of a known vocabulary token; otherwise the original.
   * Tie-break: smaller distance, then higher catalog frequency, then longer token.
   */
  findClosestToken(queryToken: string): { corrected: string; isTypo: boolean } {
    if (this.tokens.has(queryToken)) {
      return { corrected: queryToken, isTypo: false };
    }

    const maxDistance = maxDistanceForQueryToken(queryToken);
    if (maxDistance === 0) {
      return { corrected: queryToken, isTypo: false };
    }

    type Cand = { token: string; dist: number; freq: number };
    const candidates: Cand[] = [];

    for (const validToken of this.tokens) {
      const dist = levenshtein(queryToken, validToken);
      if (dist > 0 && dist <= maxDistance) {
        candidates.push({
          token: validToken,
          dist,
          freq: this.tokenFrequency.get(validToken) ?? 0,
        });
      }
    }

    if (candidates.length === 0) {
      return { corrected: queryToken, isTypo: false };
    }

    candidates.sort((a, b) => {
      if (a.dist !== b.dist) return a.dist - b.dist;
      if (a.freq !== b.freq) return b.freq - a.freq;
      return b.token.length - a.token.length;
    });

    const best = candidates[0];
    return { corrected: best.token, isTypo: true };
  }
}
