import { expect } from 'chai';
import sinon from 'ts-sinon';
import { signatures } from './decorators';
import Cursor from './cursor';
import { ALL_PLATFORMS, ALL_SERVER_VERSIONS, ALL_TOPOLOGIES, ServerVersions, asShellResult } from './enums';

describe('Cursor', () => {
  describe('help', () => {
    const apiClass: any = new Cursor({}, {});
    it('calls help function', async() => {
      expect((await apiClass.help()[asShellResult]()).type).to.equal('Help');
      expect((await apiClass.help[asShellResult]()).type).to.equal('Help');
    });
  });
  describe('signature', () => {
    it('signature for class correct', () => {
      expect(signatures.Cursor.type).to.equal('Cursor');
      expect(signatures.Cursor.hasAsyncChild).to.equal(true);
    });
    it('map signature', () => {
      expect(signatures.Cursor.attributes.map).to.deep.equal({
        type: 'function',
        returnsPromise: false,
        returnType: 'Cursor',
        platforms: ALL_PLATFORMS,
        topologies: ALL_TOPOLOGIES,
        serverVersions: ALL_SERVER_VERSIONS
      });
    });
  });
  describe('instance', () => {
    let wrappee;
    let cursor;
    beforeEach(() => {
      wrappee = {
        map: sinon.spy(),
        isClosed: (): boolean => true
      };
      cursor = new Cursor({}, wrappee);
    });

    it('sets dynamic properties', async() => {
      expect((await cursor[asShellResult]()).type).to.equal('Cursor');
      expect((await ((await cursor[asShellResult]()).value)[asShellResult]()).type).to.equal('CursorIterationResult');
      expect((await cursor.help[asShellResult]()).type).to.equal('Help');
    });

    it('returns the same cursor', () => {
      expect(cursor.map()).to.equal(cursor);
    });
    it('pretty returns the same cursor', () => {
      expect(cursor.pretty()).to.equal(cursor);
    });

    it('calls wrappee.map with arguments', () => {
      const arg = {};
      cursor.map(arg);
      expect(wrappee.map.calledWith(arg)).to.equal(true);
    });

    it('has the correct metadata', () => {
      expect(cursor.collation.serverVersions).to.deep.equal(['3.4.0', ServerVersions.latest]);
    });
  });
});
