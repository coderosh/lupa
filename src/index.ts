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
const cConsole = new CustomConsole();
const microTaskQueue = new MicroTaskQueue();

const runBtn = $("#run-btn") as HTMLButtonElement;

runBtn.addEventListener("click", () => {
  webApi.reset();
  callStack.reset();
  taskQueue.reset();
  cConsole.reset();

  if (worker) {
    worker.terminate();
  }

  const originalCode = editor.getValue();
  const code = instrumentCode(originalCode);

  worker = execCodeInWorker(code);

  worker.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);

    if (data.type === "enter") {
      const key = `${data.start}-${data.end}`;
      callStack.push(key, originalCode.slice(data.start, data.end));

      editor.highlight(data.start, data.end);
      return;
    }

    if (data.type === "exit") {
      const key = `${data.start}-${data.end}`;
      callStack.pop(key);

      editor.removeHighlight();
      return;
    }

    if (data.type === "console") {
      cConsole.push(...data.args);
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
