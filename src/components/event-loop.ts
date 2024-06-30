import { $ } from "../utils/helpers";
import getConfig from "../utils/get-config";

class EventLoop {
  private element: HTMLDivElement;

  constructor() {
    this.element = $("#event-loop") as HTMLDivElement;
  }

  animate() {
    const config = getConfig();
    const timeout = config.codeDelay;

    this.element.style.animationDuration = `${timeout}ms`;
    this.element.classList.add("animate-spin");
    setTimeout(() => {
      this.element.classList.remove("animate-spin");
      this.element.style.animationDuration = "";
    }, timeout);
  }
}

export default EventLoop;
