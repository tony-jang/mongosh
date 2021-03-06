import { shellApiClassDefault } from './decorators';
import Cursor from './cursor';
import Mongo from './mongo';
import { Cursor as ServiceProviderCursor } from '@mongosh/service-provider-core';

@shellApiClassDefault
export default class ExplainableCursor extends Cursor {
  mongo: Mongo;
  cursor: ServiceProviderCursor;
  verbosity: string;
  constructor(mongo, cursor, verbosity) {
    super(mongo, cursor);
    this.cursor = cursor;
    this.mongo = mongo;
    this.verbosity = verbosity;
  }

  /**
   * Internal method to determine what is printed for this class.
   */
  async asPrintable(): Promise<any> {
    return await this.cursor.explain(this.verbosity);
  }
}
