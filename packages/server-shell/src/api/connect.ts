import { sessionObj } from '../server';
import writer from '../response-writer';
import { mapCliToDriver } from '../index';
import { generateUri } from '@mongosh/service-provider-server';
import { v4 as uuidv4 } from 'uuid';
import Instance from '../instance';
import { parseCliArgsFromJson } from '../json-arg-mapper';
import { PostHandler } from '../api-handler';

const connect: PostHandler = async(request, response, body) => {
  const cliOption = parseCliArgsFromJson(JSON.parse(body));
  const driverUri = generateUri(cliOption);
  const driverOptions = mapCliToDriver(cliOption);
  const uuid = uuidv4();

  const instance = new Instance(cliOption);
  console.log(`connecting to ${driverUri}`);
  await instance.setup(driverUri, driverOptions);

  sessionObj[uuid] = instance;

  writer.json(response, {
    connectedUri: driverUri,
    sessionId: uuid,
  });
};

export default connect;
