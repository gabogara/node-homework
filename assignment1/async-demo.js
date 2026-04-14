const fs = require("fs");
const path = require("path");

const sampleDir = path.join(__dirname, "sample-files");
const filePath = path.join(sampleDir, "sample.txt");

// case to check if the folder ! exists
if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

// Create the file first
fs.writeFileSync(filePath, "Hello, async world!");

// 1. Callback version
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Callback error:", err.message);
    return;
  }
  console.log("Callback read:", data);
});

/*
Callback hell example:
When callbacks get nested too deeply, code becomes hard to read,
hard to maintain, and harder to debug.

Example:

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
  } else {
    fs.readFile(filePath, "utf8", (err2, data2) => {
      if (err2) {
        console.error(err2);
      } else {
        console.log(data2);
      }
    });
  }
});
*/

// 2. Promise version
fs.promises
  .readFile(filePath, "utf8")
  .then((data) => {
    console.log("Promise read:", data);
  })
  .catch((err) => {
    console.error("Promise error:", err.message);
  });

// 3. Async/Await version
async function readWithAsyncAwait() {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    console.log("Async/Await read:", data);
  } catch (err) {
    console.error("Async/Await error:", err.message);
  }
}

readWithAsyncAwait();
