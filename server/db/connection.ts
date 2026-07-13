// Dynamic loader for the `postgres` package.
// The server starts and serves non-DB routes even if the package isn't installed.
// Install with: npm install postgres

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sql: any = null;
let _error: Error | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSql(): Promise<any> {
  if (_sql)    return _sql;
  if (_error)  throw _error;

  const url = process.env.DATABASE_URL;
  if (!url) {
    _error = Object.assign(
      new Error('DATABASE_URL is not configured — set it in server/.env'),
      { status: 503 }
    );
    throw _error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let postgres: any;
  try {
    const mod = await import('postgres');
    postgres = mod.default;
  } catch {
    _error = Object.assign(
      new Error('Database driver missing. Run: npm install postgres'),
      { status: 503 }
    );
    throw _error;
  }

  try {
    _sql = postgres(url);
    console.log('[db] connected');
    return _sql;
  } catch (err) {
    throw Object.assign(
      new Error(`Database connection failed: ${(err as Error).message}`),
      { status: 503 }
    );
  }
}
