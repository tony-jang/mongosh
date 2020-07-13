import writer from '../response-writer';
import { sessionObj } from '../server';
import { GetHandler } from '../api-handler';
import Instance from '../instance';

const disconnect: GetHandler = async(request, response) => {
  const sessionId = request.headers['x-session-id'].toString();
  if (sessionId in sessionObj) {
    await (sessionObj[sessionId] as Instance).close();
    delete sessionObj[sessionId];

    writer.success(response);
  } else {
    writer.exception(response, new Error('Session Id Not found'));
  }
};

export default disconnect;

