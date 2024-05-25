export type BatchMeta = {
  offset: number;
  limit: number;
  total: number;
};

export type Batch<T> = {
  items: T[];
  meta?: BatchMeta;
};
