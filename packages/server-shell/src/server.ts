/* eslint no-console: 0, no-sync: 0*/

import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import { mapCliToDriver } from './index';
import { generateUri } from '@mongosh/service-provider-server';
import { v4 as uuidv4 } from 'uuid';
import Instance from './instance';
import { parseCliArgsFromJson } from './json-arg-mapper';

const sessionObj = {};

const writeData = (response: ServerResponse, statusCode: number, contentType: string, data: any): void => {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(data);
};

export const requestListener = async(request: IncomingMessage, response: ServerResponse): Promise<void> => {
  const resource = url.parse(request.url).pathname;
  let isHandled = false;
  let body = '';

  if (request.method === 'POST') {
    request.on('data', data => {body += data;});
  }

  try {
    switch (resource) {
      // create new instance to connect.
      case '/connect':
        if (request.method !== 'POST') {
          break;
        } else {
          isHandled = true;
        }

        request.on('end', async() => {
          try {
            const cliOption = parseCliArgsFromJson(JSON.parse(body));
            const driverUri = generateUri(cliOption);
            const driverOptions = mapCliToDriver(cliOption);
            const uuid = uuidv4();

            sessionObj[uuid] = new Instance(
              driverUri,
              { appname: 'Mongo Shell Instance', ...driverOptions },
              cliOption
            );

            writeData(
              response,
              200,
              'application/json',
              JSON.stringify({
                connectedUri: driverUri,
                sessionId: uuid,
              })
            );
          } catch (ex) {
            writeData(response, 400, 'text/plain', ex.toString());
          }
        });
        break;

      // execute Javascript code in custom context.
      case '/eval':
        if (request.method !== 'POST') {
          break;
        } else {
          isHandled = true;
        }

        request.on('end', async() => {
          try {
            const sessionId = request.headers['x-session-id'].toString();
            const instance = (sessionObj[sessionId] as Instance);

            const data = JSON.stringify(await instance.evaluation(body));

            writeData(
              response,
              200,
              'application/json',
              data
            );
          } catch (ex) {
            writeData(response, 400, 'text/plain', ex.toString());
          }
        });
        break;
      default:
        break;
    }
  } catch (ex) {
    writeData(response, 400, 'text/plain', ex.toString());
    return;
  }

  if (!isHandled) {
    writeData(response, 404, 'text/plain', '');
  }
};
