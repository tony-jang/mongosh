import http from 'http';
import { requestListener } from './server';

try {
  process.title = 'mongosh_server';
  const port = 58410;
  http.createServer(requestListener).listen(port, '127.0.0.1');
  console.log(`Server is listening on ${port}`);
} catch (e) {
  // eslint-disable-next-line no-console
  console.log(e.message);
}
