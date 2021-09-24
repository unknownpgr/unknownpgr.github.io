const { spawn } = require("child_process");
const path = require('path');

module.exports = function (src, dst, width = 320) {
  return new Promise(function (resolve, rejuect) {
    const proc = spawn('python', [path.join(__dirname, 'resizer.py'), src, dst, width]);
    proc.stdout.on('data', function (data) {
      resolve(data.toString());
    });
    proc.stderr.on('data', (data) => {
      rejuect(data.toString());
    });
  });

};