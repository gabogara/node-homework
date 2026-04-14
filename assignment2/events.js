const EventEmitter = require("events");

const emitter = new EventEmitter();

emitter.on("time", (timeString) => {
  console.log("Time received:", timeString);
});

setInterval(() => {
  emitter.emit("time", new Date().toString());
}, 5000);

module.exports = emitter;
