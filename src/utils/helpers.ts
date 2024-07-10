import { format } from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";

import hljs from "highlight.js";
import "highlight.js/styles/tokyo-night-dark.css";

export const $ = (selector: string) => document.querySelector(selector);

export const execCodeInWorker = (code: string) => {
  const blob = new Blob([code], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
};

export const formatCode = (code: string) => {
  return format(code, {
    semi: true,
    tabWidth: 2,
    parser: "babel",
    plugins: [babelPlugin, estreePlugin],
  });
};

export const highlightText = (code: string) => {
  return hljs.highlight(code, { language: "js" }).value;
};
