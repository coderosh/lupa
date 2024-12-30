import './index.css';

import { instrumentCode } from './instrument';

import CallStack from './components/call-stack';
import CustomConsole from './components/console';
import Editor from './components/editor';
import EventLoop from './components/event-loop';
import MicroTaskQueue from './components/microtask-queue';
import TaskQueue from './components/task-queue';
import WebApi from './components/web-api';
import { events } from './utils/constants';
import { CodeExecutor } from './utils/executor';
import { $ } from './utils/helpers';

let codeExecutor: CodeExecutor;

const webApi = new WebApi();
const editor = new Editor();
const callStack = new CallStack();
const taskQueue = new TaskQueue();
const eventLoop = new EventLoop();
const customConsole = new CustomConsole();
const microTaskQueue = new MicroTaskQueue();

const runBtn = $('#run-btn') as HTMLButtonElement;

runBtn.addEventListener('click', async () => {
  webApi.reset();
  callStack.reset();
  taskQueue.reset();
  customConsole.reset();
  microTaskQueue.reset();

  if (codeExecutor) {
    codeExecutor.terminate();
  }

  await editor.format();

  const originalCode = editor.getValue();
  const code = instrumentCode(originalCode);

  console.log(code);

  codeExecutor = new CodeExecutor(code);

  codeExecutor.on(events.CONSOLE_LOG, (data) => {
    customConsole.push(...data.args);
  });

  codeExecutor.on(events.FN_ENTER_CALLSTACK, (data) => {
    const key = `${data.start}-${data.end}`;

    let codeToShow = originalCode.slice(data.start, data.end);

    const codeLines = codeToShow.split('\n');
    if (codeLines.length > 4) {
      const firstLine = codeLines[0];
      const lastLine = codeLines[codeLines.length - 1];
      codeToShow = `${firstLine}\n ...... \n${lastLine}`;
    }

    callStack.push(key, codeToShow);

    editor.highlight(data.start, data.end);
  });

  codeExecutor.on(events.FN_EXIT_CALLSTACK, (data) => {
    const key = `${data.start}-${data.end}`;
    callStack.pop(key);

    editor.removeHighlight();
  });

  codeExecutor.on(events.TIMEOUT_ENTER_WEBAPI, (data) => {
    webApi.push(data.key, `timer - ${data.timeout}ms`, data.timeout);
    setTimeout(() => {
      webApi.pop(data.key);
      taskQueue.push(data.key, `${data.fn}()`);
    }, data.timeout);
  });

  codeExecutor.on(events.TIMEOUT_ENTER_STACK, (data) => {
    callStack.push(data.key, `${data.fn}()`);
    taskQueue.pop(data.key);
  });

  codeExecutor.on(events.TIMEOUT_FINISH, (data) => {
    callStack.pop(data.key);
  });

  codeExecutor.on(events.EVENT_LOOP, () => {
    eventLoop.animate();
  });

  codeExecutor.on(events.QUEUEMICROTASK_ENTER_STACK, (data) => {
    microTaskQueue.pop(data.key);
    callStack.push(data.key, `${data.fn}()`);
  });

  codeExecutor.on(events.QUEUEMICROTASK_FINISH, (data) => {
    callStack.pop(data.key);
  });

  codeExecutor.on(events.QUEUEMICROTASK_ENTER_MICROTASK, (data) => {
    microTaskQueue.push(data.key, `${data.fn}()`);
  });
});
