const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with exponential backoff retry.
 * Retries on 429 (rate limit, respecting Retry-After) and 5xx server errors.
 * Throws on non-retryable errors after all attempts are exhausted.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        if (attempt >= maxRetries) return response;
        const retryAfter = response.headers.get('Retry-After');
        const delayMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `  [RATE LIMIT] ${new URL(url).pathname} — retry ${attempt + 1}/${maxRetries} in ${delayMs}ms`
        );
        await sleep(delayMs);
        continue;
      }

      if (response.status >= 500 && attempt < maxRetries) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `  [SERVER ERROR ${response.status}] ${new URL(url).pathname} — retry ${attempt + 1}/${maxRetries} in ${delayMs}ms`
        );
        await sleep(delayMs);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `  [NETWORK ERROR] ${lastError.message} — retry ${attempt + 1}/${maxRetries} in ${delayMs}ms`
        );
        await sleep(delayMs);
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
}
