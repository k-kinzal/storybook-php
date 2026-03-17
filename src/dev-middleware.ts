import type { IncomingMessage, ServerResponse } from 'node:http';
import { PhpExecutor, type PhpExecutorOptions } from './php-executor.js';
import type { PhpRenderRequest, PhpCallableType } from './types.js';

const RENDER_PATH = '/__storybook_php/render';
const VALID_TYPES: PhpCallableType[] = [
  'classMethod',
  'staticMethod',
  'function',
  'template',
  'enumMethod',
];

export function createPhpMiddleware(options: PhpExecutorOptions = {}) {
  const executor = new PhpExecutor(options);

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    if (req.url !== RENDER_PATH || req.method !== 'POST') {
      next();
      return;
    }

    try {
      const body = await readBody(req);
      const data = JSON.parse(body) as Record<string, unknown>;

      // Validate type
      if (
        !data['type'] ||
        !VALID_TYPES.includes(data['type'] as PhpCallableType)
      ) {
        sendJson(res, 400, {
          html: '',
          error: `Invalid type: ${String(data['type'])}`,
        });
        return;
      }

      // Validate file
      if (!data['file']) {
        sendJson(res, 400, { html: '', error: 'Missing required field: file' });
        return;
      }

      const request: PhpRenderRequest = {
        type: data['type'] as PhpCallableType,
        file: data['file'] as string,
        class: (data['class'] as string) ?? null,
        callable: (data['callable'] as string) ?? null,
        args: (data['args'] as Record<string, unknown>) ?? {},
        bootstrap: (data['bootstrap'] as string) ?? null,
      };

      const result = await executor.execute(request);
      sendJson(res, result.error ? 500 : 200, result);
    } catch (err) {
      sendJson(res, 500, {
        html: '',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export { RENDER_PATH };
