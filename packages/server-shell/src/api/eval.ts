import { sessionObj } from '../server';
import writer from '../response-writer';
import { PostHandler } from '../api-handler';
import Instance from '../instance';

const evaluation: PostHandler = async(request, response, body) => {
  const sessionId = request.headers['x-session-id'].toString();

  if (sessionId in sessionObj) {
    const instance = (sessionObj[sessionId] as Instance);
    const data = await instance.evaluation(body);

    writer.json(response, data);
  } else {
    writer.exception(response, new Error('Session Id Not found'));
  }
};

export default evaluation;

