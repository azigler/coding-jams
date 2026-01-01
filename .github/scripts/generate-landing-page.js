const fs = require('fs');
const { execSync } = require('child_process');

// Read README.md
const readme = fs.readFileSync('README.md', 'utf8');

// Convert markdown to HTML using marked
let html;
try {
  html = execSync('npx -y marked README.md', { encoding: 'utf8' });
} catch (error) {
  console.error('Error converting markdown:', error);
  process.exit(1);
}

// Create the full HTML page
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>azigler/coding-jams</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  <style>
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
    @media (max-width: 767px) {
      body {
        padding: 15px;
      }
    }
    .markdown-body a {
      color: #0969da;
    }
    .markdown-body a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <article class="markdown-body">
${html}
  </article>
</body>
</html>`;

// Ensure _site directory exists
if (!fs.existsSync('_site')) {
  fs.mkdirSync('_site', { recursive: true });
}

// Write the HTML file
fs.writeFileSync('_site/index.html', fullHtml);
console.log('Landing page generated successfully!');
