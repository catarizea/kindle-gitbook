const fs = require('fs-jetpack');
const fnm = require('filenamify');
const slg = require('@sindresorhus/slugify');

module.exports = (tree, path, separator) => {
  for (let section in tree) {
    if (['title', 'authors', 'citation', 'foreword', 'preface'].indexOf(section) === -1) {
      fs.dir(`${__dirname}/../${path}/${slg(fnm(section), separator)}`);
    }
  }
};