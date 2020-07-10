/* eslint-disable no-eval */
/* eslint no-console: 0, no-sync: 0*/

import { CliOptions, NodeOptions, CliServiceProvider } from '@mongosh/service-provider-server';
import ShellEvaluator from '@mongosh/shell-evaluator';
import Nanobus from 'nanobus';
import { ShellInternalState, shellApiType, ShellResult, Cursor, AggregationCursor } from '@mongosh/shell-api';
import { MongoshWarning } from '@mongosh/errors';
import repl from 'repl';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';


class Instance {
  private shellEvaluator: ShellEvaluator;
  private bus: Nanobus;
  private internalState: ShellInternalState;
  private enableTelemetry: boolean;
  private disableGreetingMessage: boolean;
  private options: CliOptions;
  private repl: repl.REPLServer;

  cursor: {uuid: string; cursor: Cursor | AggregationCursor};

  constructor(driverUri: string, driverOptions: NodeOptions, options: CliOptions) {
    this.options = options;
    this.bus = new Nanobus('mongosh');
    this.setup(driverUri, driverOptions);
  }

  async setup(driverUri: string, driverOptions: NodeOptions): Promise<void> {
    const initialServiceProvider = await this.connect(driverUri, driverOptions);
    this.internalState = new ShellInternalState(initialServiceProvider, this.bus, this.options);

    this.shellEvaluator = new ShellEvaluator(this.internalState, this);
    await this.internalState.fetchConnectionInfo();
    this.start();
  }

  async connect(driverUri: string, driverOptions: NodeOptions): Promise<CliServiceProvider> {
    return await CliServiceProvider.connect(driverUri, driverOptions, this.options);
  }

  async close(): Promise<void> {
    await this.internalState.initialServiceProvider.close(false);
  }

  start(): void {
    this.repl = repl.start({
      terminal: true,
      writer: this.writer
    });

    const originalEval = util.promisify(this.repl.eval);

    const customEval = async(input, context, filename, callback): Promise<any> => {
      let result: ShellResult;
      try {
        result = await this.shellEvaluator.customEval(originalEval, input, context, filename);
        if (result.type === 'Cursor') {
          const uuid = uuidv4();
          this.cursor = { uuid, cursor: this.internalState.currentCursor };

          return callback(null, { type: 'CursorInfo', value: uuid } as ShellResult);
        }
      } catch (err) {
        return callback(err);
      }
      callback(null, result);
    };

    (this.repl as any).eval = customEval;

    this.internalState.setCtx(this.repl.context);
    Object.defineProperty(this.repl.context, 'db', {
      set: (newDb) => {
        if (newDb === undefined || newDb[shellApiType] !== 'Database') {
          const warn = new MongoshWarning('Cannot reassign \'db\' to non-Database type');
          console.log(warn);
          return;
        }
        this.internalState.setDbFunc(newDb);
      },
      get: () => (this.internalState.currentDb)
    });
  }

  async evaluation(expression: string): Promise<ShellResult> {
    const result = await new Promise((resolve: (v?: ShellResult) => void, rejected) => {
      try {
        this.repl.eval(expression, this.repl.context, '', (err, r) => {
          if (err) {
            rejected(err);
          } else {
            resolve(r);
          }
        });
      } catch (ex) {
        rejected(ex);
      }
    });

    return result;
  }

  writer = (result: any): string => {
    if (result && result.message && typeof result.stack === 'string') {
      this.bus.emit('mongosh:error', result);
      this.shellEvaluator.revertState();

      throw result;
    }

    return result;
  };

  toggleTelemetry(enabled: boolean): string {
    this.enableTelemetry = enabled;
    this.disableGreetingMessage = true;

    if (enabled) {
      return 'endabled Telemetry';
    }

    return 'disabled Telemetry';
  }
}

export default Instance;
