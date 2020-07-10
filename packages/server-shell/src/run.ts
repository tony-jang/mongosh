/* eslint @typescript-eslint/no-unused-vars: 0, no-sync: 0*/

import { parseCliArgs, mapCliToDriver, USAGE } from './index';
import { generateUri } from '@mongosh/service-provider-server';
import http from 'http';
import { requestListener } from './server';
import Instance from './instance';
import ShellEvaluator from '@mongosh/shell-evaluator';

try {
  const options = parseCliArgs(process.argv);
  const { version } = require('../package.json');

  if (options.help) {
    // eslint-disable-next-line no-console
    console.log(USAGE);
  } else if (options.version) {
    // eslint-disable-next-line no-console
    console.log(version);
  } else {
    process.title = 'mongosh_server';
    const driverOptions = mapCliToDriver(options);
    const driverUri = generateUri(options);
    const appname = `${process.title} ${version}`;
    /* eslint no-new:0 */
    http.createServer(requestListener).listen(25849, '127.0.0.1');
    console.log(`Server is listening on ${25849}`);
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.log(e.message);
}
