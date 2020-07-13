import { IncomingMessage, ServerResponse } from 'http';

export default interface ApiHandler {
  resource: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  handler: GetHandler | PostHandler;
}

export type PostHandler =
  (
    request: IncomingMessage,
    response: ServerResponse,
    body: string
  ) => Promise<void>;


export type GetHandler =
  (
    request: IncomingMessage,
    response: ServerResponse,
  ) => Promise<void>;
