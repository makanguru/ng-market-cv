export interface QueryParamsInterface {
  page: number;
  perPage: number;
  view: 'list' | 'grid';
  country?: number;
  city?: number;
  startsWith?: string;
  search?: string;
}
