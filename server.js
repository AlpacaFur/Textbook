const express = require("express");
let app = express();
let scss = require("./scss.js")


/* Data Loading */
let textbooks = {}
require("./textbook_data/textbook_registry.json").textbooks.forEach((id)=>{
  textbooks[id] = require(`./textbook_data/${id}/meta.json`)
})


const textbookManifest = JSON.stringify(textbooks)

function getTextbook(id) {
  let textbook = textbooks[id]
  if (!textbook) return false;
  return textbook;
}

function getChapter(id, chapterId) {
  let textbook = getTextbook(id)
  if (!textbook) return false;
  let chapter = textbook.chapters[chapterId]
  if (!chapter) return false;
  return chapter;
}

function propertyCheck(object, properties) {
  return properties.every(prop => object[prop] !== undefined)
}

function requiredProperties(...properties) {
  return (req, res, next) => {
    if (!req.body || !propertyCheck(req.body, properties)) {
      res.sendStatus(404)
    }
    else {
      next()
    }
  };
}

app.use(express.static("static"))
app.use(express.json())

app.post("/getTextbooks", (req, res)=>{
  res.status(200).send(textbookManifest)
})

app.post("/getChapter", requiredProperties("bookId", "chapterNumber"), (req, res)=>{
  let data = req.body;
  let chapter = getChapter(data.bookId, data.chapterNumber)
  if (!chapter) {
    res.sendStatus(404)
  }
  else {
    res.status(200).sendFile(`${data.bookId}/chapters/${chapter}.json`, {root:__dirname+"/textbook_data"})
  }
})

console.log()
scss.generate({log:true})
console.log(`Watching ./static for SCSS changes!`)
scss.watch()
console.log()

app.listen(4000, ()=>{
  console.log("Server Online!");
})
