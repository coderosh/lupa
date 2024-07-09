import {
  overrideConsole,
  overrideQueueMicrotask,
  overrideSetTimeout,
  postMsgCallExpression,
} from "./codes";
import CodeIntrumentor from "./instrumentor";

export function instrumentCode(code: string) {
  const instrumentor = new CodeIntrumentor(code);

  const updatedCode = instrumentor.instrument({
    callExpression: {
      before(node) {
        const callee = instrumentor.stringify(node.callee);
        return postMsgCallExpression(
          node.start,
          node.end,
          callee,
          "normal:enter-callstack"
        );
      },
      after(node) {
        const callee = instrumentor.stringify(node.callee);
        return postMsgCallExpression(
          node.start,
          node.end,
          callee,
          "normal:exit-callstack"
        );
      },
    },
  });

  return `
    ${overrideConsole()}

    ${overrideSetTimeout()}

    ${overrideQueueMicrotask()}

    ${updatedCode}
  `;
}
