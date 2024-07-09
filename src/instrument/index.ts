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
        return postMsgCallExpression(node.start, node.end, callee, "enter");
      },
      after(node) {
        const callee = instrumentor.stringify(node.callee);
        return postMsgCallExpression(node.start, node.end, callee, "exit");
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
