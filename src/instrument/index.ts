import {
  createLupaFn,
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
        return postMsgCallExpression(
          node.start,
          node.end,
          "normal:enter-callstack"
        );
      },
      after(node) {
        const callee = instrumentor.stringify(node.callee);
        return postMsgCallExpression(
          node.start,
          node.end,
          "normal:exit-callstack"
        );
      },
    },
  });

  return `
    ${createLupaFn()}
    
    ${overrideConsole()}

    ${overrideSetTimeout()}

    ${overrideQueueMicrotask()}

    ${updatedCode}
  `;
}
