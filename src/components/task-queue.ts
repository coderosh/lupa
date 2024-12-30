import { $, highlightText } from '../utils/helpers';

class TaskQueue {
  private element: HTMLDivElement;
  private record!: Record<string, HTMLElement>;

  constructor() {
    this.element = $('#task-queue') as HTMLDivElement;
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
      'rounded-md',
      'inline-block',
      'bg-card',
      'text-sm',
    );
    node.innerHTML = highlightText(value);
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

export default TaskQueue;
