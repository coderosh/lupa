import dedent from 'dedent';
import { $, highlightText } from '../utils/helpers';

class CallStack {
  private element: HTMLDivElement;
  private record!: Record<string, HTMLElement>;

  constructor() {
    this.element = $('#call-stack') as HTMLDivElement;
    this.reset();
  }

  reset() {
    this.element.innerHTML = '';
    this.record = {};
  }

  push(key: string, value: string) {
    const node = document.createElement('pre');
    node.classList.add(
      'border',
      'border-border',
      'p-2',
      'font-mono',
      'bg-card',
      'rounded-md',
      'text-xs',
      'overflow-x-auto',
    );
    const newValue = dedent(value);
    node.innerHTML = highlightText(newValue);
    this.element.appendChild(node);

    this.record[key] = node;
  }

  pop(key: string) {
    const childToRemove = this.record[key];
    if (!childToRemove) return;
    this.element.removeChild(childToRemove);
    delete this.record[key];
  }
}

export default CallStack;
