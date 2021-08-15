import * as R from 'ramda';

export function smooth(_arrNumbers: number[], nSmoothFactor: number, bZeroPading = false) {
  const arrNumbers = bZeroPading
    ? _arrNumbers
    : R.repeat(_arrNumbers[0], nSmoothFactor).concat(_arrNumbers);
  return arrNumbers
    .slice(bZeroPading ? 0 : nSmoothFactor)
    .reduce((acc: number[], _nValue: number, _nIndex: number) => {
      const nIndex = _nIndex + nSmoothFactor;
      acc.push(R.sum(arrNumbers.slice(nIndex - nSmoothFactor, nIndex)) / nSmoothFactor);
      return acc;
    }, []);
}

export function smoothPair(
  [xNow, yNow] = [0, 0],
  [_xLast, _yLast] = [0, 0],
  nSmoothFactor: number
) {
  const [xLast, yLast] = [_xLast ?? 0, _yLast ?? 0];
  return [
    xNow * nSmoothFactor + (1 - nSmoothFactor) * xLast,
    yNow * nSmoothFactor + (1 - nSmoothFactor) * yLast,
  ];
}

export function binarySearchN(arrValues: number[], value: number): number {
  const nHalf = Math.floor(arrValues.length / 2);
  const nTest = arrValues[nHalf];
  const arrHalf = value < nTest ? arrValues.slice(0, nHalf) : arrValues.slice(nHalf);

  if (nTest === value || arrValues.length <= 1) return nTest;
  return binarySearchN(arrHalf, value);
}

const range = (init: number, final: number) =>
  [...Array(final - init)].map((_, index) => index + init);

const zip = <K, T>(x: T[], y: K[]) => x.map((value, index) => [value, y[index]]);
