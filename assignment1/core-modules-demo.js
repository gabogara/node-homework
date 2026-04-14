const os = require('os');
const path = require('path');
const fs = require('fs');

const sampleFilesDir = path.join(__dirname, 'sample-files');
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log('Platform:', os.platform());
console.log('CPU:', os.cpus()[0].model);
console.log('Total Memory:', os.totalmem());

// Path module
const joinedPath = path.join(__dirname, 'sample-files', 'folder', 'file.txt');
console.log('Joined path:', joinedPath);

// fs.promises API
async function runDemo() {
  const demoFilePath = path.join(sampleFilesDir, 'demo.txt');
  await fs.promises.writeFile(demoFilePath, 'Hello from fs.promises!');
  const demoContent = await fs.promises.readFile(demoFilePath, 'utf8');
  console.log('fs.promises read:', demoContent);

  // Streams for large files- log first 40 chars of each chunk
  const largeFilePath = path.join(sampleFilesDir, 'largefile.txt');

  let largeContent = '';
  for (let i = 1; i <= 100; i++) {
    largeContent += `This is a line in a large file... Line ${i}\n`;
  }

  await fs.promises.writeFile(largeFilePath, largeContent);

  const stream = fs.createReadStream(largeFilePath, {
    encoding: 'utf8',
    highWaterMark: 1024,
  });

  stream.on('data', (chunk) => {
    console.log('Read chunk:', chunk.slice(0, 40));
  });

  stream.on('end', () => {
    console.log('Finished reading large file with streams.');
  });

  stream.on('error', (err) => {
    console.error('Stream error:', err.message);
  });
}

runDemo().catch((err) => {
  console.error('Error:', err.message);
});