import "./index.css";

import { instrumentCode } from "./instrument";

import WebApi from "./components/web-api";
import Editor from "./components/editor";
import CustomConsole from "./components/console";
import CallStack from "./components/call-stack";
import TaskQueue from "./components/task-queue";
import EventLoop from "./components/event-loop";
import { $, execCodeInWorker } from "./utils/helpers";
import MicroTaskQueue from "./components/microtask-queue";

let worker: Worker;

const webApi = new WebApi();
const editor = new Editor();
const callStack = new CallStack();
const taskQueue = new TaskQueue();
const eventLoop = new EventLoop();
const customConsole = new CustomConsole();
const microTaskQueue = new MicroTaskQueue();

const runBtn = $("#run-btn") as HTMLButtonElement;

runBtn.addEventListener("click", () => {
  webApi.reset();
  callStack.reset();
  taskQueue.reset();
  customConsole.reset();
  microTaskQueue.reset();

  if (worker) {
    worker.terminate();
  }

  const originalCode = editor.getValue();
  const code = instrumentCode(originalCode);

  worker = execCodeInWorker(code);

  worker.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);

    if (data.type === "normal:enter-callstack") {
      const key = `${data.start}-${data.end}`;

      let codeToShow = originalCode.slice(data.start, data.end);

      const codeLines = codeToShow.split("\n");
      if (codeLines.length > 4) {
        const firstLine = codeLines[0];
        const lastLine = codeLines[codeLines.length - 1];
        codeToShow = `${firstLine}\n ...... \n${lastLine}`;
      }

      callStack.push(key, codeToShow);

      editor.highlight(data.start, data.end);
      return;
    }

    if (data.type === "normal:exit-callstack") {
      const key = `${data.start}-${data.end}`;
      callStack.pop(key);

      editor.removeHighlight();
      return;
    }

    if (data.type === "console") {
      customConsole.push(...data.args);
      return;
    }

    if (data.type === "timeout:enter-webapi") {
      webApi.push(data.key, `timer - ${data.timeout}ms`, data.timeout);
      setTimeout(() => {
        webApi.pop(data.key);
        taskQueue.push(data.key, `${data.fn}()`);
      }, data.timeout);
      return;
    }

    if (data.type === "timeout:enter-stack") {
      callStack.push(data.key, `${data.fn}()`);
      taskQueue.pop(data.key);
      return;
    }

    if (data.type === "timeout:finish") {
      callStack.pop(data.key);
      return;
    }

    if (data.type === "event-loop") {
      eventLoop.animate();
      return;
    }

    if (data.type === "queuemicrotask:enter-microtask") {
      microTaskQueue.push(data.key, `${data.fn}()`);
      console.log("pushed to microtask");

      return;
    }

    if (data.type === "queuemicrotask:enter-stack") {
      microTaskQueue.pop(data.key);
      callStack.push(data.key, `${data.fn}()`);
      return;
    }

    if (data.type === "queuemicrotask:finish") {
      callStack.pop(data.key);
      return;
    }
  });
});
