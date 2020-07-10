import http from 'http';
import { requestListener } from './server';

try {
  process.title = 'mongosh_server';
  http.createServer(requestListener).listen(25849, '127.0.0.1');
  console.log(`Server is listening on ${25849}`);
} catch (e) {
  // eslint-disable-next-line no-console
  console.log(e.message);
}
