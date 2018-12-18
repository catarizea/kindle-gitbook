const fs = require('fs-jetpack');
const fnm = require('filenamify');
const slg = require('@sindresorhus/slugify');

module.exports = (tree, path, separator) => {
  let summary = `# Summary

### Intro

* [Cover](cover.md)
`;
  
  for (let section in tree) {
    if (['title', 'authors', 'citation', 'foreword'].indexOf(section) === -1) {
      if (section === 'preface') {
        summary += `* [Preface](preface.md)
`;
      } else {
        summary += `
### ${section}

`;
        for (let chapter in tree[section]) {
          summary += `* [${chapter}](${slg(fnm(section), separator)}/${slg(fnm(chapter), separator)}.md)
`;
        }
      }
    }
  }

  fs.write(`${__dirname}/../${path}/SUMMARY.md`, summary);
};