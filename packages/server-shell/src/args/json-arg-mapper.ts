import { CliOptions } from '@mongosh/service-provider-server';
import parseCliArgs from './arg-parser';

const Mapping = {
  userId: 'username',
  password: 'password',
};

export function parseCliArgsFromJson(args: any): CliOptions {
  const strArr = ['', ''];

  if (!args.server || !args.port) {throw new Error('Host or Port must provide.');}

  if (args.database) {
    strArr.push(`mongodb://${args.server}:${args.port}/${args.database}`);
  } else {
    strArr.push(`mongodb://${args.server}:${args.port}`);
  }

  Object.keys(Mapping).forEach(option => {
    if (args.hasOwnProperty(option)) {
      const mapping = Mapping[option];
      strArr.push(`--${mapping}`, `${args[option]}`);
    }
  });


  return parseCliArgs(strArr);
}
