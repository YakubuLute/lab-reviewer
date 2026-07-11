// Dynamic import so the server starts even if drizzle-orm/postgres aren't installed.
// DB features return 503 until `npm install drizzle-orm postgres` is run.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;
let _initError: Error | null = null;
let _initializing = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDb(): Promise<any> {
  if (_db) return _db;
  if (_initError) throw _initError;
  if (_initializing) {
    // Busy-wait a bit for concurrent callers
    await new Promise(r => setTimeout(r, 50));
    if (_db) return _db;
    if (_initError) throw _initError;
  }

  _initializing = true;

  const url = process.env.DATABASE_URL;
  if (!url) {
    _initError = Object.assign(
      new Error('DATABASE_URL is not configured. Set it in server/.env'),
      { status: 503 }
    );
    throw _initError;
  }

  try {
    const [drizzleMod, postgresMod, schemaMod] = await Promise.all([
      import('drizzle-orm/postgres-js'),
      import('postgres'),
      import('./schema.js'),
    ]);
    _db = drizzleMod.drizzle(postgresMod.default(url), { schema: schemaMod });
    console.log('[db] connected');
    return _db;
  } catch (err) {
    _initError = Object.assign(
      new Error(
        'Database packages not installed. Run: npm install drizzle-orm postgres\n' +
        String((err as Error).message)
      ),
      { status: 503 }
    );
    throw _initError;
  } finally {
    _initializing = false;
  }
}
