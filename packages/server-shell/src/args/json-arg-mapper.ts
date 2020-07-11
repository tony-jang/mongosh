import { CliOptions } from '@mongosh/service-provider-server';
import { parseCliArgs } from '..';

const Mapping = {
  server: 'host',
  port: 'port',
  database: 'db',
  userId: 'username',
  password: 'password',
};

export function parseCliArgsFromJson(args: any): CliOptions {
  const strArr = ['', ''];

  Object.keys(Mapping).forEach(option => {
    if (args.hasOwnProperty(option)) {
      const mapping = Mapping[option];
      strArr.push(`--${mapping}`, `${args[option]}`);
    }
  });
  return parseCliArgs(strArr);
}
