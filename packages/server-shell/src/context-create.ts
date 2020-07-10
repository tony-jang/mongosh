import vm from 'vm';

const globalBuiltins = new Set(vm.runInNewContext('Object.getOwnPropertyNames(globalThis)'));

export default function createContext(): vm.Context {
  const context = vm.createContext();

  for (const name of Object.getOwnPropertyNames(global)) {
    // Only set properties that do not already exist as a global builtin.
    if (!globalBuiltins.has(name)) {
      Object.defineProperty(context, name, Object.getOwnPropertyDescriptor(global, name));
    }
  }

  context.global = context;
  return context;
}
