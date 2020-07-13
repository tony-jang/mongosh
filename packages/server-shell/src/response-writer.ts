import { ServerResponse } from 'http';

const data = (response: ServerResponse, statusCode: number, contentType: string, d: any): void => {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(d);
};

const success = (response: ServerResponse): void => {
  response.writeHead(200, { 'Content-Type': 'text/plain' } );
  response.end('');
};

const json = (response: ServerResponse, j: any): void => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(j));
};

const exception = (response: ServerResponse, error: Error): void => {
  response.writeHead(400, { 'Content-Type': 'text/plain' } );
  response.end(error.toString());
};

const unauthorized = (response: ServerResponse, error: Error): void => {
  response.writeHead(401, { 'Content-Type': 'text/plain' } );
  response.end(error.toString());
};

export default { data, success, json, exception, unauthorized };
