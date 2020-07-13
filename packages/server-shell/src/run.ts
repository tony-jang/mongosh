/* eslint-disable no-console */
import http from 'http';
import { requestListener } from './server';
import color from './color';

const y = color.FgYellow;
const r = color.Reset;
const g = color.FgGreen;

try {
  process.title = 'mongosh_server';
  const port = 58410;
  http.createServer(requestListener).listen(port, '127.0.0.1');
  console.log(`Mongo Server listening on ${y}localhost${r}:${g}${port}${r}`);
} catch (e) {
  console.log(e.message);
}
