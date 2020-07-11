import writer from '../response-writer';
import { PostHandler } from '../api-handler';

const acorn = require('acorn');

const parse: PostHandler = async(request, response, data) => {
  writer.json(
    response,
    acorn.parse(data)
      .body
      .map(n => {
        return { start: n.start, end: n.end };
      })
  );
};

export default parse;
