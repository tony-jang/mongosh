import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import Instance from './instance';
import allApi from './api';
import ApiHandler from './api-handler';
import writer from './response-writer';

export const sessionObj: {[uuid: string]: Instance} = {};

const getBody = async(request: IncomingMessage): Promise<string> => {
  if (request.method !== 'POST') {
    return '';
  }

  let body = '';
  request.on('data', data => {body += data;});
  await new Promise((r) => request.on('end', () => r()));

  return body;
};

// eslint-disable-next-line complexity
export const requestListener = async(request: IncomingMessage, response: ServerResponse): Promise<void> => {
  const resource = url.parse(request.url).pathname;
  const method = request.method;
  const body = await getBody(request);

  const apis: ApiHandler[] = [
    {
      resource: '/connect',
      method: 'POST',
      handler: allApi.connect,
    },
    {
      resource: '/disconnect',
      method: 'DELETE',
      handler: allApi.disconnect,
    },
    {
      resource: '/eval',
      method: 'POST',
      handler: allApi.eval,
    },
    {
      resource: '/parse',
      method: 'POST',
      handler: allApi.parse,
    },
    {
      resource: '/read',
      method: 'GET',
      handler: allApi.read,
    },
    {
      resource: '/clear',
      method: 'GET',
      handler: allApi.clear,
    }
  ];

  try {
    for (const api of apis) {
      if (api.resource === resource && api.method === method) {
        // if method is not 'POST', body will not used
        await api.handler(request, response, body);
        return;
      }
    }
  } catch (ex) {
    if (ex.codeName === 'Unauthorized') {
      writer.unauthorized(response, ex);
    } else {
      writer.exception(response, ex);
    }
    return;
  }

  writer.data(response, 404, 'text/plain', '');
};
