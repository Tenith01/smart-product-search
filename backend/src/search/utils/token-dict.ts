import { tokenize } from './tokenizer';
import { levenshtein } from './levenshtein';

export class TokenDictionary {
  private tokens: Set<string> = new Set();

  build(productNames: string[], productTagsList: string[][]) {
    this.tokens.clear();
    for (const name of productNames) {
      const nameTokens = tokenize(name);
      for (const t of nameTokens) this.tokens.add(t);
    }
    for (const tags of productTagsList) {
      for (const tag of tags) {
        const tagTokens = tokenize(tag);
        for (const t of tagTokens) this.tokens.add(t);
      }
    }
  }

  // Returns corrected token if typo found (distance <= 2), else original.
  // Prioritizes closer matches.
  findClosestToken(queryToken: string, maxDistance: number = 2): { corrected: string, isTypo: boolean } {
    if (this.tokens.has(queryToken)) {
      return { corrected: queryToken, isTypo: false };
    }

    let closest = queryToken;
    let minDistance = Infinity;

    for (const validToken of this.tokens) {
      const dist = levenshtein(queryToken, validToken);
      if (dist <= maxDistance && dist < minDistance) {
        minDistance = dist;
        closest = validToken;
      }
    }

    if (minDistance <= maxDistance) {
      return { corrected: closest, isTypo: true };
    }

    return { corrected: queryToken, isTypo: false };
  }
}
