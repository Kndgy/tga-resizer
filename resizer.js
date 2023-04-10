const fs = require('fs');
const path = require('path');
const TGA = require('tga');

function resizeTGAFilesFromFolder(inputFolderPath, outputFolderPath) {
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
  }

  fs.readdir(inputFolderPath, function (err, files) {
    if (err) {
      console.error(err);
      return;
    }

    let count = 0;
    files.forEach(function (file) {
      if (path.extname(file) === '.TGA') {
        const inputFile = path.join(inputFolderPath, file);
        const outputFile = path.join(outputFolderPath, file);
        fs.readFile(inputFile, function (err, data) {
          if (err) {
            console.error(err);
            return;
          }

          const width = data.readUInt16LE(12);
          const height = data.readUInt16LE(14);
          console.log(`${file}: ${width}x${height}`);
          
          const tga = new TGA(data);
          const newWidth = Math.floor(width / 4) * 4;
          const newHeight = Math.floor(height / 4) * 4;
          const resizedPixels = new Uint8Array(newWidth * newHeight * 4);
          for (let i = 0; i < newHeight; i++) {
            const srcRowOffset = i * width * 4;
            const dstRowOffset = i * newWidth * 4;
            for (let j = 0; j < newWidth * 4; j++) {
              resizedPixels[dstRowOffset + j] = tga.pixels[srcRowOffset + j];
            }
          }
          
          const resizedData = TGA.createTgaBuffer(newWidth, newHeight, resizedPixels);
          fs.writeFileSync(outputFile, resizedData);
          
          count++;
          if (count === files.filter(f => path.extname(f) === '.TGA').length) {
            console.log(`Total files: ${count}`);
          }
        });
      }
    });
  });
}

const inputFolderPath = 'D:/textures/old';
const outputFolderPath = 'D:/textures/old_resized';
resizeTGAFilesFromFolder(inputFolderPath, outputFolderPath);
