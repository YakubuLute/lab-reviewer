// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null;
let _tried = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRedis(): Promise<any | null> {
  if (_tried) return _client;
  _tried = true;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    const { default: Redis } = await import('ioredis');
    _client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    _client.on('error', (err: Error) => {
      console.warn('[redis] error (caching degraded):', err.message);
    });
    return _client;
  } catch {
    console.warn('[redis] ioredis not installed — caching disabled. Run: npm install ioredis');
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (_client) {
    await _client.quit().catch(() => _client?.disconnect());
    _client = null;
  }
}
