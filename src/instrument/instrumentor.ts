import { Parser } from "acorn";
import type {
  Program,
  Node,
  CallExpression,
  ArrowFunctionExpression,
} from "acorn";
import { simple } from "acorn-walk";

interface InstrumentFunctions<T = Node> {
  after?: (node: T) => string;
  before?: (node: T) => string;
}

interface InstrumentObj {
  callExpression?: InstrumentFunctions<CallExpression>;
  arrowFunctionExpression?: InstrumentFunctions<ArrowFunctionExpression>;
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

        const finalCode = `__lupa_fn(() => { ${beforeCode} }, () => ${currentStr}, () => { ${afterCode} })`;

        that.replace(node, finalCode);
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
}

export default CodeIntrumentor;
