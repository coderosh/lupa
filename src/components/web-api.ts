import { $ } from "../utils/helpers";

class WebApi {
  private element: HTMLDivElement;
  private record!: Record<string, HTMLElement>;

  constructor() {
    this.element = $("#web-api") as HTMLDivElement;
    this.reset();
  }

  reset() {
    this.element.innerHTML = "";
    this.record = {};
  }

  push(key: string, value: string, timeout: number) {
    const node = document.createElement("div");
    node.classList.add(
      "border",
      "border-border",
      "p-2",
      "my-2",
      "flex",
      "items-center",
      "gap-2",
      "bg-card",
      "rounded-md"
    );
    node.innerHTML = /* HTML */ `
      <div
        style="animation-duration: ${timeout}ms"
        class="progress-bar w-8 h-8"
      ></div>
      <span>${value}</span>
    `;

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

export default WebApi;
