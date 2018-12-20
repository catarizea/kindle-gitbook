const generatePage = (section, chapter, headings) => {
  let page = `# ${section}

## ${chapter}

`;

  for (let heading in headings) {
    page += `### ${heading}

`;  
    if (headings[heading].length) {
      headings[heading].forEach(head => {
        if (head.indexOf('*||*') === -1) {
          if (/^Figure [0-9]+- [0-9]+\. /.test(head) || /^Figure [MDCLXVI]+- [0-9]\./.test(head)) {
            const parts = head.split('.');
            page += `![](/assets/${parts[0]}.png)

`;
          } else {
            page += `${head}

`;
          }
        } else {
          const items = head.split('*||*');
          if (items.length) {
            items.forEach(item => {
              if (item.trim()) {
                page += `* ${item.trim()}
`;
              }
            });

            page += `
`; 
          }
        }
      });
    }
  }
  
  return page;
};

const generateCover = tree => {
  let page = `# ${tree.title}

## ${tree.authors}

### ${tree.citation}

![](/assets/cover.jpg)

`;

  if (tree.foreword && tree.foreword.length) {
    tree.foreword.forEach(item => {
      page += `${item}

`;
    })
  }

  return page;
}

const generatePreface = tree => {
  if (!tree.preface) {
    return false;
  }

  let page = `# Preface
  
`;

  for (let heading in tree.preface) {
    page += `### ${heading}
  
`;
    
    if (tree.preface[heading].length) {
      tree.preface[heading].forEach(item => {
        page += `${item}

`;
      })
    }
  }

  return page;
}

module.exports = {
  generatePage,
  generateCover,
  generatePreface
};