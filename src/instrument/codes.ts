import getConfig from "../utils/get-config";

export const syncDelay = (ms: number) => {
  return /* JS */ `
  ;(() => {
      const start = Date.now();
      let now = start;
      while (now - start < ${ms}) {
          now = Date.now();
      }
    })();
  `;
};

export const postMsgCallExpression = (
  start: number,
  end: number,
  callee: string,
  type: "enter" | "exit"
) => {
  const config = getConfig();
  return /* JS */ `
    postMessage(JSON.stringify({ 
      type: "${type}",
      callee: ${callee},
      start: ${start},
      end: ${end}
    }));

    ${syncDelay(config.codeDelay)}
  `;
};

export const overrideConsole = () => {
  return /* JS */ `
    console.log = (...args) => {
      postMessage(JSON.stringify({
          type: "console",
          args: args,
      }))
    }
  `;
};

export const overrideSetTimeout = () => {
  const config = getConfig();

  return /* JS */ `
    const _setTimeout = setTimeout

    self.setTimeout = (fn, ms) => {
      const key = Date.now()
      postMessage(JSON.stringify({
          type: "timeout-to-webapi",
          timeout: ms,
          key: key,
          fn: fn.name || "anonymous"
      }))

      return _setTimeout(() => {
          postMessage(JSON.stringify({
              type: "event-loop",
          }))

          ${syncDelay(config.codeDelay)}

          postMessage(JSON.stringify({
              type: "timeout-to-stack",
              timeout: ms,
              key: key,
              fn: fn.name || "anonymous"
          }))

          ${syncDelay(config.codeDelay)}

          fn()

          postMessage(JSON.stringify({
              type: "timeout-finish",
              timeout: ms,
              key: key,
              fn: fn.name || "anonymous"
          }))
      }, ms)
    }
  `;
};

export const createCallExpressionWithValue = (
  before: string,
  after: string,
  current: string
) => {
  return `
            (() => {
              ${before}
              const __lupa_var = ${current}
              ${after}

              return __lupa_var
            })();
          `;
};
