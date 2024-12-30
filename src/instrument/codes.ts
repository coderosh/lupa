import { events } from '../utils/constants';
import getConfig from '../utils/get-config';

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
  type: string,
) => {
  const config = getConfig();
  return /* JS */ `
    postMessage(JSON.stringify({ 
      type: "${type}",
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
          type: "${events.CONSOLE_LOG}",
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
          type: "${events.TIMEOUT_ENTER_WEBAPI}",
          timeout: ms,
          key: key,
          fn: fn.name || "anonymous"
      }))

      return _setTimeout(() => {
          postMessage(JSON.stringify({
              type: "${events.EVENT_LOOP}",
          }))

          ${syncDelay(config.codeDelay)}

          postMessage(JSON.stringify({
              type: "${events.TIMEOUT_ENTER_STACK}",
              timeout: ms,
              key: key,
              fn: fn.name || "anonymous"
          }))

          ${syncDelay(config.codeDelay)}

          fn()

          postMessage(JSON.stringify({
              type: "${events.TIMEOUT_FINISH}",
              timeout: ms,
              key: key,
              fn: fn.name || "anonymous"
          }))
      }, ms)
    }
  `;
};

export const overrideQueueMicrotask = () => {
  const config = getConfig();
  return /* JS */ `
    const _queueMicrotask = queueMicrotask

    self.queueMicrotask = (fn) => {
      const key = Date.now()

      postMessage(JSON.stringify({
        type: "${events.QUEUEMICROTASK_ENTER_MICROTASK}",
        key: key,
        fn: fn.name || "anonymous"
      }))

      return _queueMicrotask(() => {
        postMessage(JSON.stringify({
          type: "${events.EVENT_LOOP}"
        }))

        ${syncDelay(config.codeDelay)}

        postMessage(JSON.stringify({
          type: "${events.QUEUEMICROTASK_ENTER_STACK}",
          key: key,
          fn: fn.name || "anonymous"
        }))

        ${syncDelay(config.codeDelay)}

        fn()

        postMessage(JSON.stringify({
          type: "${events.QUEUEMICROTASK_FINISH}",
          key: key,
        }))
      })
    }
  `;
};

export const createLupaFn = () => {
  return /* JS */ `
   const __lupa_fn = (before, current, after) => {
      before()
      const value = current()
      after()
      return value
    }
  `;
};
