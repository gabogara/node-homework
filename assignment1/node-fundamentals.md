# Node.js Fundamentals

## What is Node.js?
Is a JavaScript runtime environment that enables JavaScript code to be executed outside the browser. This means Node gives us capability to write our code that can run on servers.

## How does Node.js differ from running JavaScript in the browser?
Node.js allows JavaScript to run outside the browser, on the server, with access to the file system and operating system. In contrast, JavaScript in the browser runs on the client side and is mainly used to manipulate the DOM and handle user interactions, with limited access to system resources.

## What is the V8 engine, and how does Node use it?
The V8 engine is a high-performance JavaScript engine developed by Google for Chrome. Node.js uses V8 to execute JavaScript code outside the browser by compiling it into machine code, making it fast and efficient.

## What are some key use cases for Node.js?
Some common use cases for Node.js include:

- Building APIs and backend services
- Real-time applications like chat apps, using WebSockets
- Automation scripts
- Data processing pipelines

> Basically everything that is backend or system tools.

## Explain the difference between CommonJS and ES Modules. Give a code example of each.

The main difference is that CommonJS was designed specifically for Node.js and uses require(), while ES Modules follow the official JavaScript standard and use import/export syntax.

**CommonJS (default in Node.js):**

```js
// import
const fs = require('fs');

// export
module.exports = function greet() {
  console.log("Hello");
};
```

**ES Modules (supported in modern Node.js):**


```js
// import
import fs from 'fs';

// export
export function greet() {
  console.log("Hello");
}
``` 