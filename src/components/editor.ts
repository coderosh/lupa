import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Decoration } from "@codemirror/view";
import {
  EditorState,
  StateField,
  StateEffect,
  type Range,
  type StateEffectType,
} from "@codemirror/state";

import { tokyoNight } from "@uiw/codemirror-themes-all";
import { $ } from "../utils/helpers";

const defaultCode = /* JS */ `
function test(fn) {
    console.log("test start")
    fn()
    console.log("test end")
}

test(() => {
    console.log("middle")

    setTimeout(() => {
        console.log("from timeout")
    }, 1000)
})
`.trim();

class Editor {
  private editor: EditorView;
  private highlightEffect!: StateEffectType<Range<Decoration>[]>;

  constructor(parentSel = "#code-editor") {
    const parent = $(parentSel);

    if (!parent) {
      throw new Error(`${parentSel} not found in document.`);
    }

    const highlightExtension = this.getHighlightExtension();

    this.editor = new EditorView({
      extensions: [basicSetup, tokyoNight, highlightExtension, javascript()],
      parent,
    });

    this.setValue(defaultCode);
  }

  setValue(value: string) {
    this.editor.dispatch({
      changes: {
        from: 0,
        to: this.editor.state.doc.length,
        insert: value,
      },
    });
  }

  getValue() {
    return this.editor.state.doc.toString();
  }

  highlight(start: number, end: number) {
    const dec = Decoration.mark({
      attributes: {
        class: "rounded-sm bg-card border-border border",
      },
    });

    this.editor.dispatch({
      effects: this.highlightEffect.of([dec.range(start, end)]),
    });
  }

  removeHighlight() {
    this.editor.dispatch({
      effects: this.highlightEffect.of([]),
    });
  }

  private getHighlightExtension() {
    this.highlightEffect = StateEffect.define<Range<Decoration>[]>();
    const that = this;

    return StateField.define({
      create() {
        return Decoration.none;
      },
      update(value, transaction) {
        let val = value.map(transaction.changes);

        for (const effect of transaction.effects) {
          if (effect.is(that.highlightEffect)) {
            val = val.update({
              add: effect.value,
              sort: true,
              filter(from, to, value) {
                return (
                  from === effect.value[0]?.from &&
                  to === effect.value[0]?.to &&
                  effect.value[0]?.value === value
                );
              },
            });
          }
        }

        return val;
      },
      provide: (f) => EditorView.decorations.from(f),
    });
  }
}

export default Editor;
