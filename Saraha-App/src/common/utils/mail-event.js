import { EventEmitter } from "events";

const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", (fn) => {
  fn();
});

export default emailEmitter;
