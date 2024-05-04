export type Converter<S, T> = {
  convert(data: S): Promise<T> | T;
};
