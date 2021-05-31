const ctx: Worker = self as any;

export interface WorkerData {
  type: "message" | "run";
  msg?: string;
  args?: any;
  fnType?: string;
}

export function isType(type: string): type is WorkerData["type"] {
  return ["message", "run"].includes(type);
}

const mFuncs = new Map<string, (objArgs: any) => any>();

const add = (args: string[]) => {
  return args.map(Number).reduce((acc, num) => acc + num, 0);
};

const div = ([x = "0", y = "0"]) => Number(x) / Number(y);
const range = ([init = "0", final = "0"]): number[] => {
  const initial = Number(init);
  const numFinal = Number(final);
  return [...Array(numFinal - initial)].map((_value, index) => index + initial);
};

const fibo = ([n = "10"]: string | number[], result = 1, prev = 1): number =>
  Number(n) ? fibo([Number(n) - 1], result + prev, result) : result;

const isPrime = ([n = "1"], nTest = 2): boolean =>
  Math.sqrt(Number(n)) < nTest
    ? true
    : Number(n) % nTest === 0
    ? false
    : isPrime([n], nTest + 1);

mFuncs.set("add", add);
mFuncs.set("div", div);
mFuncs.set("range", range);
mFuncs.set("fibo", fibo);
mFuncs.set("prime", isPrime);

const fnRun = (data: WorkerData) => {
  const result = mFuncs.get(data.fnType as string)?.(data.args);
  ctx.postMessage({ type: "run", result });
};

// Post data to parent thread
ctx.postMessage({ foo: "foo" });

// Respond to message from parent thread
ctx.addEventListener("message", ({ data }: { data: WorkerData }) => {
  console.log(data);
  switch (data.type) {
    case "message":
      console.log(data.msg);
      break;
    case "run":
      fnRun(data);
      break;
  }
});

export type AddFuncParams = Parameters<typeof add>;
