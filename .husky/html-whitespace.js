const fs = require('fs');
const path = require('path');

// Directory containing HTML snippets (including subdirectories)
const snippetsDir = './.snippets/code';

// Function to modify leading whitespace inside <span> elements
function replaceLeadingWhitespaceInSpan(content) {
  return content.replace(/(<span[^>]*?>)(\s+)/g, (match, spanTag, leadingWhitespace) => {
    // Replace leading spaces with &nbsp;
    const replacedWhitespace = leadingWhitespace.replace(/ /g, '&nbsp;');
    return spanTag + replacedWhitespace;
  });
}

// Recursive function to process HTML files in directories and subdirectories
function processHtmlFiles(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Unable to read directory: ${err}`);
      return;
    }

    // Loop through files in the directory
    files.forEach(file => {
      const filePath = path.join(dir, file);

      // Check if the file is a directory
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats for file ${filePath}: ${err}`);
          return;
        }

        if (stats.isDirectory()) {
          // If it's a directory, recursively process the directory
          processHtmlFiles(filePath);
        } else if (path.extname(file) === '.html') {
          // If it's an HTML file, read and process it
          fs.readFile(filePath, 'utf-8', (err, content) => {
            if (err) {
              console.error(`Unable to read file ${file}: ${err}`);
              return;
            }

            // Modify leading whitespace in <span> elements
            const modifiedContent = replaceLeadingWhitespaceInSpan(content);

            // Write the modified content back to the file
            fs.writeFile(filePath, modifiedContent, 'utf-8', err => {
              if (err) {
                console.error(`Unable to write file ${file}: ${err}`);
              } else {
                console.log(`Processed: ${filePath}`);
              }
            });
          });
        }
      });
    });
  });
}

// Run the script on the snippets directory
processHtmlFiles(snippetsDir);
