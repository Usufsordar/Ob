const fs = require('fs');
const esprima = require('esprima');
const escodegen = require('escodegen');

function obfuscateJS(jsCode) {
  const ast = esprima.parseScript(jsCode);

  let varCount = 0;
  const nameMap = {};

  function renameIdentifiers(node) {
    if (!node) return;

    if (node.type === 'Identifier') {
      if (!nameMap[node.name]) {
        nameMap[node.name] = 'v' + varCount++;
      }
      node.name = nameMap[node.name];
    }

    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        renameIdentifiers(node[key]);
      }
    }
  }

  renameIdentifiers(ast);

  const obfuscated = escodegen.generate(ast, { format: { compact: true } });
  return obfuscated;
}

function minifyHTML(html) {
  // Remove HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  // Remove line breaks and multiple spaces
  html = html.replace(/\n/g, ' ').replace(/\s\s+/g, ' ');
  return html.trim();
}

function extractAndObfuscate(html) {
  // Regex to find <script>...</script>
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let newHtml = html;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const originalJS = match[1];
    const obfuscatedJS = obfuscateJS(originalJS);
    // Replace the original JS with obfuscated JS inside the HTML
    newHtml = newHtml.replace(originalJS, obfuscatedJS);
  }

  // Minify HTML
  newHtml = minifyHTML(newHtml);
  return newHtml;
}

// Read input.html
const inputHTML = fs.readFileSync('input.html', 'utf8');

// Process and obfuscate
const outputHTML = extractAndObfuscate(inputHTML);

// Save to output.html
fs.writeFileSync('output.html', outputHTML);

console.log('Obfuscation complete! Check output.html');
