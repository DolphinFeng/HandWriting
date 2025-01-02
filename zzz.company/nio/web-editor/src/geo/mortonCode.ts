interface NdsCoord {
  x: number
  y: number
}

export class MortonCode {
  public code: number;
  public level: number;
  constructor(code: number, level: number) {
    this.level = level;
    this.code = code;
  }

  toNdsCoordinates(): NdsCoord {
    const YBASE = 2 ** 30;
    const XBASE = 2 ** 31;

    let bit = 1;
    let mortonCode = this.code;

    let x = 0;
    let y = 0;

    for (let i = 0; i < 31; i++) {
      x |= mortonCode & bit;
      mortonCode >>= 1;
      y |= mortonCode & bit;
      bit <<= 1;
    }

    x |= mortonCode & bit;
    mortonCode >>= 1;

    if (y >= YBASE) {
      y -= 2 ** 31;
    }

    if (x >= XBASE) {
      x -= 2 ** 32;
    }
    return {
      x,
      y,
    };
  }
}
