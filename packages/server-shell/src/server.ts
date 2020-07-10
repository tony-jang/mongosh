/* eslint no-console: 0, no-sync: 0*/

import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import mapCliToDriver from './arg-mapper';
import { generateUri } from '@mongosh/service-provider-server';
import { v4 as uuidv4 } from 'uuid';
import Instance from './instance';
import { parseCliArgsFromJson } from './json-arg-mapper';

const sessionObj: {[uuid: string]: Instance} = {};
const acorn = require('acorn');

const writeData = (response: ServerResponse, statusCode: number, contentType: string, data: any): void => {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(data);
};

// eslint-disable-next-line complexity
export const requestListener = async(request: IncomingMessage, response: ServerResponse): Promise<void> => {
  const resource = url.parse(request.url).pathname;
  let isHandled = false;
  let body = '';

  if (request.method === 'POST') {
    request.on('data', data => {body += data;});
  }

  try {
    switch (resource) {
      // clear all connected instance.
      case '/clear':
        if (request.method !== 'DELETE') {
          break;
        } else {
          isHandled = true;
        }

        for (const session in sessionObj) {
          if (sessionObj.hasOwnProperty(session)) {
            delete sessionObj[session];
          }
        }

        response.writeHead(200);
        response.end();
        console.log('[DELETE/OK] /clear: All instances are cleared.');
        break;

      // create new instance to connect.
      case '/connect':
        if (request.method !== 'POST') {
          break;
        } else {
          isHandled = true;
        }

        console.log('[POST] /connect: request');

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

            console.log(`[POST/OK] /connect: Instance Created (${uuid}/${driverUri})`);

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

      // remove exists instance.
      case '/disconnect':
        if (request.method !== 'DELETE') {
          break;
        } else {
          isHandled = true;
        }
        try {
          const sessionId = request.headers['x-session-id'].toString();
          if (sessionId in sessionObj) {
            const instance = (sessionObj[sessionId] as Instance);
            await instance.close();

            delete sessionObj[sessionId];

            response.writeHead(200);
            response.end();
            console.log(`[DELETE/OK] /disconnect (target: ${sessionId})`);
          } else {
            writeData(response, 400, 'text/plain', 'Session Id Not found');
          }
        } catch (ex) {
          writeData(response, 400, 'text/plain', ex.toString());
          console.log('[DELETE/ERR] /disconnect');
        }
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

            if (sessionId in sessionObj) {
              const instance = (sessionObj[sessionId] as Instance);

              const node = acorn.parse(body);
              const result = [];

              for (const expr of node.body.map(n => body.substring(n.start, n.end))) {
                const data = await instance.evaluation(expr);
                result.push(data);
              }

              writeData(
                response,
                200,
                'application/json',
                JSON.stringify(result)
              );
              console.log(`[POST/OK] /eval (target: ${sessionId})`);
            } else {
              writeData(response, 400, 'text/plain', 'Session Id Not found');
            }
          } catch (ex) {
            writeData(response, 400, 'text/plain', ex.toString());
            console.log('[POST/ERR] /eval');
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
