declare module '*.json' {
  const value: any;
  export default value;
}

interface Array<T> {
  filter<U extends T>(pred: (a: T) => a is U): U[];
}
