import { Parser } from "acorn";
import type { Program, Node, CallExpression } from "acorn";
import { simple } from "acorn-walk";
import { instrumentCode } from ".";

interface InstrumentFunctions<T = Node> {
  after?: (node: T) => string;
  before?: (node: T) => string;
}

interface InstrumentObj {
  callExpression?: InstrumentFunctions<CallExpression>;
}

class CodeIntrumentor {
  public root: Program;
  private chunks: string[];

  constructor(public code: string) {
    this.chunks = code.split("");
    this.root = Parser.parse(code, { ecmaVersion: "latest", locations: true });
  }

  instrument(insObj: InstrumentObj) {
    const that = this;
    simple(this.root, {
      CallExpression(node) {
        const currentStr = that.stringify(node);

        const beforeCode = insObj.callExpression?.before?.(node) ?? "";
        const afterCode = insObj.callExpression?.after?.(node) ?? "";

        that.replace(
          node,
          that.getReplaceStringForCallExpression(
            beforeCode,
            currentStr,
            afterCode
          )
        );
      },
    });

    return this.chunks.join("");
  }

  public stringify(node: Node) {
    return this.chunks.slice(node.start, node.end).join("");
  }

  public replace(node: Node, str: string) {
    this.chunks[node.start] = str;

    for (let i = node.start + 1; i < node.end; i++) {
      this.chunks[i] = "";
    }
  }

  private getReplaceStringForCallExpression(
    before: string,
    current: string,
    after: string
  ) {
    return /* JS */ `
      (() => {
        ${before}

        const __lupa_var = ${current}

        ${after}

        return __lupa_var
      })();
    `;
  }
}

export default CodeIntrumentor;
