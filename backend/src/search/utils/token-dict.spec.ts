import { TokenDictionary } from './token-dict';

describe('TokenDictionary', () => {
  const dict = new TokenDictionary();

  beforeAll(() => {
    dict.build(
      [
        'Sony WH-1000XM5 Wireless Headphones',
        'Samsung Galaxy Phone',
        'Merino Wool Sweater',
      ],
      [
        ['wireless', 'bluetooth', 'sony'],
        ['samsung', 'android', 'galaxy'],
        ['merino', 'wool', 'sweater'],
      ],
      [
        'Industry-leading noise cancelling with crystal clear sound.',
        'A powerful smartphone with wireless charging.',
        'Classic merino wool construction.',
      ],
      ['Electronics', 'Electronics', 'Clothing'],
    );
  });

  it('corrects common typos toward catalog vocabulary (wirelss → wireless)', () => {
    const r = dict.findClosestToken('wirelss');
    expect(r.isTypo).toBe(true);
    expect(r.corrected).toBe('wireless');
  });

  it('corrects merino wool typo (mernio → merino)', () => {
    const r = dict.findClosestToken('mernio');
    expect(r.isTypo).toBe(true);
    expect(r.corrected).toBe('merino');
  });

  it('leaves exact tokens unchanged', () => {
    const r = dict.findClosestToken('wireless');
    expect(r.isTypo).toBe(false);
    expect(r.corrected).toBe('wireless');
  });

  it('does not fuzzy-match very short tokens (avoids spurious corrections)', () => {
    const r = dict.findClosestToken('ab');
    expect(r.isTypo).toBe(false);
    expect(r.corrected).toBe('ab');
  });
});
