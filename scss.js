const sass = require("sass")
const fs = require("fs")
const glob = require("glob")

function warn(text) {
  return `\x1b[33m${text}\x1b[0m`;
}

function generate(options) {
  let log = options && options.log;
  let files = glob.sync("static/**/*.scss", {});
  let now;
  if (log) {
    now = Date.now()
    console.log(`Parsing ${files.length} SCSS files.`)
  };
  files.forEach(file => generateCSS(file))

  if (log) {
    let after = Date.now()
    console.log(`Done in ${(after-now)/1000} seconds.`)
  };
}

function generateCSS(filePath) {
  sass.render({file:filePath}, (err, data)=>{
    if (err) {
      console.log(warn(err.formatted));
      return;
    };
    let target = filePath.replace(".scss", ".css")
    fs.writeFileSync(target, data.css)
  })
}

function startWatch() {
  fs.watch("static", {recursive:true}, (event, filename)=>{
    if (filename && filename.endsWith(".scss") && event !== "delete") {
      console.log(`Parsing ${filename}`)
      generateCSS("static/" + filename)
      console.log(`Parsed!`)
    }
  })
}

exports.watch = startWatch;
exports.generate = generate;
