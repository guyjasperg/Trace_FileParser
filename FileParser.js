const Path = require("path");
const FS = require("fs")
const utf8 = require("utf8");
const iconv = require("iconv-lite");
const spawn = require('child_process').spawn

const nReadlines = require("n-readlines");
const { get } = require("http");
const broadbandLines = new nReadlines("temp.txt");

let line;
let lineNumber = 1;
let files = [];
let encoding;
let currentLine, newBuf;

spawnProcess();

GetFilesFromDirectory("C:\\Diags\\Morrisons\\DD\\Set1\\WMM0056POS116-220709-212710")
//GetFilesFromDirectory("C:\\Projects\\Trace_FileParser\\Data")
//console.log(files);

files.forEach(File => {
  if (Path.basename(File).toLowerCase() === "terminalinfo.dat") {
    console.log(Path.basename(File));
    encoding = getFileEncoding(File);

    //check processor name
    console.log(getFileEncoding(File))

    const lines = new nReadlines(File);
    while ((line = lines.next())) {
      if (getStringEncoding(line) != encoding) {
        //make sure buffer does not start with 0
        if (line[0] === 0x00) {
          newBuf = Uint8Array.prototype.slice.call(line, 1);
        }
        else {
          newBuf = line;
        }

        //insert encoding to line
        if (encoding === 'utf16le') {
          const buf = Buffer.from([0xFF, 0xFE])
          const buf2 = Buffer.concat([buf, newBuf]);
          currentLine = buf2.toString(encoding)
        }
      }
      else {
        currentLine = line.toString(encoding)
      }

      //const nLine = line.toString(encoding);
      if (currentLine.indexOf('Processor Name') >= 0) {
        console.log(currentLine);
        break;
      }
    }
  }
})


while ((line = broadbandLines.next())) {
  //console.log(`Line ${lineNumber} has: ${line.toString("ascii")}`);
  lineNumber++;
}

function GetFilesFromDirectory(Directory) {
  FS.readdirSync(Directory).forEach(file => {
    //check if dir
    const abs = Path.join(Directory, file);
    if (FS.statSync(abs).isDirectory()) {
      return GetFilesFromDirectory(abs);
    }
    else {
      //process file
      files.push(abs);
    }
  })
}

function getFileEncoding(f) {
  var d = new Buffer.alloc(5, [0, 0, 0, 0, 0]);
  var fd = FS.openSync(f, 'r');
  FS.readSync(fd, d, 0, 5, 0);
  FS.closeSync(fd);

  // https://en.wikipedia.org/wiki/Byte_order_mark
  var e = false;
  if (!e && d[0] === 0xEF && d[1] === 0xBB && d[2] === 0xBF)
    e = 'utf8';
  if (!e && d[0] === 0xFE && d[1] === 0xFF)
    e = 'utf16be';
  if (!e && d[0] === 0xFF && d[1] === 0xFE)
    e = 'utf16le';
  if (!e)
    e = 'ascii';

  return e;
}

function getStringEncoding(line) {
  // https://en.wikipedia.org/wiki/Byte_order_mark
  var e = false;
  if (!e && line[0] === 0xEF && line[1] === 0xBB && line[2] === 0xBF)
    e = 'utf8';
  if (!e && line[0] === 0xFE && line[1] === 0xFF)
    e = 'utf16be';
  if (!e && line[0] === 0xFF && line[1] === 0xFE)
    e = 'utf16le';
  if (!e)
    e = 'ascii';

  return e;
}

function spawnProcess() {
  const cmd = spawn('dir')

  cmd.stdout.on('data', (data) => {
    console.log('spawnProcess:' + data.toString())
  })
}