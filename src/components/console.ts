import { $ } from '../utils/helpers';

type LogParam = string | number | object | LogParam[];

class CustomConsole {
  private element: HTMLDivElement;

  constructor() {
    this.element = $('#console') as HTMLDivElement;
    this.reset();
  }

  reset() {
    this.element.innerHTML = '';
  }

  push(...args: LogParam[]) {
    const node = document.createElement('div');
    node.classList.add('font-mono', 'flex', 'items-center', 'gap-2');
    node.innerHTML = /* HTML */ `
    <span class="text-border">❯</span>
    <span>
    ${args.map((arg) => this.getPrintValue(arg)).join('&nbsp;&nbsp;')}
    </span>
    `;
    this.element.appendChild(node);
  }

  // TODO: add support for other types
  private getPrintValue(arg: LogParam) {
    if (typeof arg === 'number') return `<span class="ͼkc">${arg}</span>`;
    if (typeof arg === 'string') return `<span class="ͼk7">${arg}</span>`;

    return arg;
  }
}

export default CustomConsole;
