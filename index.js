const cheerio = require('cheerio');
const fs = require('fs-jetpack');
const get = require('lodash.get');
const replace = require('lodash.replace');
const util = require('util');

const outputPath = './output/parsed.json';
const $ = cheerio.load(fs.read('./email-html/index.html'));

const sectionMatch = /^[MDCLXVI]+\./;
const chapterMatch = /^[0-9]+\./;
const headerMatch = /- .* >/;
const separator = '*||*';
const separatorMatch = /\*\|\|\*/;

const source = {};
let section = null;
let chapter = null;
let header = null;
let isList = false;
let textOverHeader = false;
let headerOverAgain = false;

$('div').each(function(i, el) {
  const self = $(this);
  const className = self.attr('class');

  if (className === 'bookTitle') {
    source[`"title"`] = self.text().trim();
  }

  if (className === 'authors') {
    source[`"authors"`] = self.text().trim();
  }

  if (className === 'citation') {
    source[`"citation"`] = self.text().trim();
  }

  if (className === 'sectionHeading') {
    const text = replaceQuotes(self.text().trim());

    if (sectionMatch.test(text)) {
      section = text;
      source[section] = {};
      chapter = null;
      textOverHeader = false;
    } else if (/foreword/i.test(text)) {
      section = 'foreword';
      source[`"${section}"`] = [];
      textOverHeader = false;
    } else if (/preface/i.test(text)) {
      section = 'preface';
      source[`"${section}"`] = {};
      textOverHeader = false;
    }

    if (chapterMatch.test(text) && section 
      && /foreword/i.test(section) === false
      && /preface/i.test(section) === false) {
      chapter = text;
      source[section][chapter] = {};
      header = null;
      textOverHeader = false;
    }
  }

  if (className === 'noteHeading') {
    const headerText = replaceQuotes(self.text().trim());
    isList = /highlight_pink/.test(self.html());
    headerOverAgain = /highlight_blue/.test(self.html());

    if (headerText && section && headerOverAgain) { 
      const parent = get(source, [section, chapter], null);
      if (parent) {
        const head = `"${replaceQuotes(self.next().text().trim())}"`;
        if (head && header !== head) {
          header = head;
          parent[header] = [];
          textOverHeader = true;
        }
      }
    }
    
    if (headerText && section && !textOverHeader) {
      if (chapter) {
        if (headerMatch.test(headerText)) {
          const parent = get(source, [section, chapter], null);
          const head = `"${getHeader(headerMatch.exec(headerText).toString())}"`;
          if (parent && head) {
            if (header !== head) {
              header = head;
              parent[header] = [];
            }
          }
        }
      } else {
        if (/preface/i.test(section)) {
          const head = `"${getHeader(headerMatch.exec(headerText).toString())}"`;
          if (head) {
            if (header !== head) {
              header = head;
              source['"preface"'][header] = [];
            }
          }
        } else {
          const headerObj = headerMatch.exec(headerText);
          if (headerObj) {
            const head = `"${getHeader(headerObj.toString())}"`;
            if (head) {
              if (!source[section]['"intro"']) {
                source[section]['"intro"'] = {};
              }
              if (header !== head) {
                header = head;
                source[section]['"intro"'][header] = [];
              }
            }
          }
        }
      }
    }
  }

  if (className === 'noteText' && !headerOverAgain) {
    const noteText = replaceQuotes(self.text().trim());
    let parent = get(source, [section, chapter, header], null);

    if (!parent) {
      parent = get(source, [section, '"intro"', header], null);
    }
    
    if (!parent) {
      parent = get(source, ['"preface"', header], null);
    }

    if (!parent && /foreword/i.test(section)) {
      parent = source['"foreword"'];
    }
    
    if (noteText && parent) {
      if (!isList) {
       parent.push(noteText);
      } else {
        const length =parent.length;
        if (!length) {
         parent.push(noteText + separator);
        } else {
          if (separatorMatch.test(parent[length - 1])) {
           parent[length - 1] = parent[length - 1] + noteText + separator;
          } else {
           parent.push(noteText + separator);
          }
        }
      }
    }
  }
});

fs.write(
  outputPath, 
  replace(replace(util.inspect(source, { depth: 3 }), /'/g, `"`), /""/g, '"')
);

function getHeader(header) {
  if (!header) {
    return;
  }

  const arr = header.split(' >');
  if (!arr[0]) {
    return;
  }

  return arr[0].substr(2);
}

function replaceQuotes(string) {
  return replace(replace(string, /'/g, '&apos;'), /"/g, '&quot;');
}
