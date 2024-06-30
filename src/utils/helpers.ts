export const $ = (selector: string) => document.querySelector(selector);

export const execCodeInWorker = (code: string) => {
  const blob = new Blob([code], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
};
