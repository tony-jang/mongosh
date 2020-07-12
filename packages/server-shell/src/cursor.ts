import { Cursor as ShellApiCursor, Mongo } from '@mongosh/shell-api';
import { Document } from '@mongosh/service-provider-core';

export default class Cursor {
  mongo: Mongo;
  cursor: ShellApiCursor;
  private addedValue: any[];
  private index = 0;
  constructor(mongo, cursor, addedValue?: any[]) {
    this.cursor = cursor;
    this.mongo = mongo;
    this.addedValue = addedValue;
  }

  addOption(option: number): Cursor {
    this.cursor.addOption(option);
    return this;
  }

  allowPartialResults(): Cursor {
    this.cursor.allowPartialResults();
    return this;
  }

  batchSize(size: number): Cursor {
    this.cursor.batchSize(size);
    return this;
  }

  clone(): Cursor {
    return new Cursor(this.mongo, this.cursor.clone());
  }

  close(options: Document): Promise<void> {
    return this.cursor.close(options);
  }

  collation(spec: Document): Cursor {
    this.cursor.collation(spec);
    return this;
  }

  comment(cmt: string): Cursor {
    this.cursor.comment(cmt);
    return this;
  }

  count(): Promise<number> {
    return this.cursor.count();
  }

  explain(verbosity: string): Promise<any> {
    return this.cursor.explain(verbosity);
  }

  forEach(f): Promise<void> {
    return this.cursor.forEach(f);
  }

  hasNext(): Promise<boolean> {
    if (this.addedValue && this.addedValue.length > this.index) {
      return new Promise((r) => r(true));
    }
    return this.cursor.hasNext();
  }

  hint(index: string): Cursor {
    this.cursor.hint(index);
    return this;
  }

  isClosed(): boolean {
    if (this.addedValue && this.addedValue.length > this.index) {
      return false;
    }
    return this.cursor.isClosed();
  }

  isExhausted(): Promise<boolean> {
    return this.cursor.isExhausted();
  }

  itcount(): Promise<number> {
    return this.cursor.itcount();
  }

  limit(value: number): Cursor {
    this.cursor.limit(value);
    return this;
  }

  map(f): Cursor {
    this.cursor.map(f);
    return this;
  }

  max(indexBounds: Document): Cursor {
    this.cursor.max(indexBounds);
    return this;
  }

  maxTimeMS(value: number): Cursor {
    this.cursor.maxTimeMS(value);
    return this;
  }

  min(indexBounds: Document): Cursor {
    this.cursor.min(indexBounds);
    return this;
  }

  next(): Promise<any> {
    if (this.addedValue && this.addedValue.length > this.index) {
      return this.addedValue[this.index++];
    }
    return this.cursor.next();
  }

  noCursorTimeout(): Cursor {
    this.cursor.noCursorTimeout();
    return this;
  }

  oplogReplay(): Cursor {
    this.cursor.oplogReplay();
    return this;
  }

  projection(spec: Document): Cursor {
    this.cursor.projection(spec);
    return this;
  }

  readPref(preference: string): Cursor {
    this.cursor.readPref(preference);
    return this;
  }

  returnKey(enabled: boolean): Cursor {
    this.cursor.returnKey(enabled);
    return this;
  }

  size(): Promise<number> {
    return this.cursor.size();
  }

  skip(value: number): Cursor {
    this.cursor.skip(value);
    return this;
  }

  sort(spec: Document): Cursor {
    this.cursor.sort(spec);
    return this;
  }

  tailable(): Cursor {
    this.cursor.tailable();
    return this;
  }

  toArray(): Promise<Document[]> {
    return this.cursor.toArray();
  }

  pretty(): Cursor {
    return this;
  }
}
