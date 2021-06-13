export function* genMap<T, K>(fn: (x: T) => K, iter: Iterable<T>) {
  for (const value of iter) {
    yield fn(value);
  }
}

export function objMap<T, K, ObjType extends { [key: string]: T }>(
  fn: (x: T) => K,
  obj: ObjType
): { [Prop in keyof ObjType]: K } {
  const arrObj = genMap((key) => [key, fn(obj[key])], Object.keys(obj));
  return Object.fromEntries(arrObj);
}
