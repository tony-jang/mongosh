import writer from '../response-writer';
import { sessionObj } from '../server';
import { GetHandler } from '../api-handler';

const read: GetHandler = async(request, response) => {
  const sessionId = request.headers['x-session-id']?.toString();
  const cursorId = request.headers['x-cursor-id']?.toString();

  const chunkSize = request.headers.hasOwnProperty('x-chunk-size') ?
    parseInt(request.headers['X-Chunk-Size']?.toString(), 10) : 20;

  if (sessionId in sessionObj) {
    const instance = sessionObj[sessionId];
    if (!instance.cursor) {
      writer.exception(response, new Error('This session does not have any Cursor.'));
      return;
    }
    if (instance.cursor.uuid !== cursorId) {
      writer.exception(response, new Error(`This session does not '${cursorId}' Cursor.`));
      return;
    }

    const cursor = instance.cursor.cursor;
    const list = [];
    for (let i = 0; i < chunkSize; i++) {
      if (cursor.isClosed() || !await cursor.hasNext()) {
        instance.cursor = undefined;
        break;
      }
      list.push(await cursor.next());
    }

    writer.json(response, list);
  } else {
    writer.exception(response, new Error('Session Id Not found'));
  }
};

export default read;
