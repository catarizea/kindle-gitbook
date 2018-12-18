const fs = require('fs-jetpack');
const fnm = require('filenamify');
const slg = require('@sindresorhus/slugify');
const chapterWorker = require('./chapter');

const {
  generateCover,
  generatePreface,
  generatePage
} = chapterWorker;

module.exports = (tree, path, separator) => {
  const cover = generateCover(tree);
  if (cover) {
    fs.write(`${__dirname}/../${path}/cover.md`, cover);
  }

  const preface = generatePreface(tree);
  if (preface) {
    fs.write(`${__dirname}/../${path}/preface.md`, preface);
  }

  for (let section in tree) {
    if (['title', 'authors', 'citation', 'foreword', 'preface'].indexOf(section) === -1) {
      for (let chapter in tree[section]) {
        const page = generatePage(section, chapter, tree[section][chapter]);
        
        if (page) {
          fs.write(`${__dirname}/../${path}/${slg(fnm(section), separator)}/${slg(fnm(chapter), separator)}.md`, page);
        }
      }
    }
  }
};