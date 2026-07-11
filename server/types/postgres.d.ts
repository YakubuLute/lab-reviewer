// Minimal stub so TypeScript compiles without the `postgres` package installed.
// The real types take over once `npm install postgres` is run.
declare module 'postgres' {
  interface SqlQuery extends Promise<Row[]> { [Symbol.iterator](): Iterator<Row> }
  type Row = Record<string, unknown>;
  interface Sql {
    (template: TemplateStringsArray, ...values: unknown[]): SqlQuery;
    unsafe(query: string, params?: unknown[]): SqlQuery;
    end(): Promise<void>;
  }
  function postgres(url: string, options?: Record<string, unknown>): Sql;
  export default postgres;
}
