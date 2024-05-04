export interface BatchMeta {
  offset: number;
  limit: number;
  total: number;
}

export interface Batch<T> {
  items: T[];
  meta?: BatchMeta;
}
