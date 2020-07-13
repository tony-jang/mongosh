import writer from '../response-writer';
import { sessionObj } from '../server';
import { GetHandler } from '../api-handler';

const clear: GetHandler = async(request, response) => {
  for (const session in sessionObj) {
    if (sessionObj.hasOwnProperty(session)) {
      await sessionObj[session].close();
      delete sessionObj[session];
    }
  }
  writer.success(response);
};

export default clear;
