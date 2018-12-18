const fs = require('fs-jetpack');

const fileStructureWorker = require('./workers/fileStructure');
const summaryWorker = require('./workers/summary');
const pagesWorker = require('./workers/pages');

const tree = JSON.parse(fs.read(`${__dirname}/output/parsed.json`));
const path = 'output/gitbook';
const separator = { separator: '_' };

fileStructureWorker(tree, path, separator);
summaryWorker(tree, path, separator);
pagesWorker(tree, path, separator);