const express = require('express');
const path = require('path');
const fs = require('fs');
const nunjucks = require('nunjucks');
require('dotenv').config();

const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'articles.json');

nunjucks.configure('views', { autoescape: true, express: app });
app.use('/static', express.static(path.join(__dirname, 'public')));

function loadArticles() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE,'utf-8')); }
  catch(e){ return { articles: [] }; }
}

app.get('/', (req, res) => {
  const db = loadArticles();
  res.render('index.njk', { articles: db.articles.slice().reverse() });
});

app.get('/article/:id', (req, res) => {
  const db = loadArticles();
  const a = db.articles.find(x=>x.id===req.params.id);
  if(!a) return res.status(404).send('Not found');
  res.render('article.njk', { article: a });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
