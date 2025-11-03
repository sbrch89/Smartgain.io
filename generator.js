const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { nanoid } = require('nanoid');
require('dotenv').config();

const DATA_FILE = path.join(__dirname, 'data', 'articles.json');
const AFF_FILE = path.join(__dirname, 'affiliates.json');
const LANGS = (process.env.LANGUAGES || 'ar,en,fr').split(',');
const PER_LANG = parseInt(process.env.DAILY_PER_LANGUAGE || '3');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));

function loadAffiliates() {
  try { return JSON.parse(fs.readFileSync(AFF_FILE, 'utf-8')); }
  catch(e){ return { links: [] }; }
}

function saveArticles(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function loadArticles() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
  catch(e){ return { articles: [] }; }
}

function injectAffiliate(content, affiliates) {
  if (!affiliates || !affiliates.links || affiliates.links.length === 0) return content;
  const link = affiliates.links[Math.floor(Math.random()*affiliates.links.length)];
  return content + `\n\n<a href="${link.url}" rel="nofollow noreferrer">${link.text}</a>`;
}

async function generateArticleOpenAI(lang) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const prompt = {
    en: "Write a short, useful article (about 300-400 words) about an actionable tip to make money online. Use clear headings and friendly tone.",
    fr: "Écris un article court (300-400 mots) sur un conseil pratique pour gagner de l'argent en ligne. Utilise un ton amical et des sous-titres.",
    ar: "اكتب مقالًا قصيرًا (300-400 كلمة) عن نصيحة عملية للربح من الإنترنت. استخدم لهجة ودية وعناوين فرعية."
  }[lang] || prompt['en'];

  try {
    const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{role:'user', content: prompt}],
      max_tokens: 800,
    }, {
      headers: { Authorization: `Bearer ${key}` }
    });
    const text = resp.data.choices[0].message.content;
    return text;
  } catch (e) {
    console.error('OpenAI error', e.message || e);
    return null;
  }
}

function generatePlaceholder(lang) {
  const samples = {
    en: "Quick tip: Start by validating a small niche... (placeholder)",
    fr: "Astuce : Commencez par valider une petite niche... (placeholder)",
    ar: "نصيحة سريعة: ابدأ بالتحقق من فكرة صغيرة... (نص تجريبي)"
  };
  return samples[lang] || samples['en'];
}

async function makeArticlesOnce() {
  const db = loadArticles();
  const affiliates = loadAffiliates();

  for (const lang of LANGS) {
    for (let i=0;i<PER_LANG;i++) {
      let content = await generateArticleOpenAI(lang);
      if (!content) content = generatePlaceholder(lang);
      const article = {
        id: nanoid(10),
        lang,
        title: content.split('\n')[0].slice(0,80) || 'Untitled',
        content: injectAffiliate(content, affiliates),
        date: new Date().toISOString()
      };
      db.articles.push(article);
      console.log('Generated article', article.id, lang);
    }
  }
  saveArticles(db);
}

module.exports = { makeArticlesOnce };
