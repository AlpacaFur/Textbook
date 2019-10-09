const settingsManifest = {
  display: {
    theme: "auto",
  },
}

let settings = new Settings(settingsManifest);

settings.listen("display.theme", (value)=>{
  document.body.setAttribute("data-theme", value)
})

document.getElementById("returnHome").addEventListener("click", ()=>{
  document.body.classList.add("fadeout");
  setTimeout(()=>{
    window.location.pathname = ""
  }, 1000)
})

let settingsContainer = document.getElementById("settingsContainer")
document.getElementById("openSettings").addEventListener("click", ()=>{
  settingsContainer.classList.add("show");
})
document.getElementById("closeSettings").addEventListener("click", ()=>{
  settingsContainer.classList.remove("show");
})

const urlParams = new URLSearchParams(window.location.search);
const textbookID = urlParams.get('bookID') || 1;
const chapter = Number(urlParams.get('chapter')) || 0;
history.replaceState({}, "Test", "/read/");

function getData(id, callback) {
  let data = fetch(`/textbooks/${id}/meta.json`, {})
    .then(res=>res.json())
    .then(data=>callback(data))
}

document.addEventListener("keydown", (event)=>{
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  switch (event.key) {
    case "ArrowUp":
      book.backward()
      event.preventDefault()
      break;
    case "ArrowLeft":
      book.backward()
      event.preventDefault()
      break;
    case "ArrowDown":
      book.forward()
      event.preventDefault()
      break;
    case "ArrowRight":
      book.forward()
      event.preventDefault()
      break;
    default:
  }
})


let book = new Book(document.getElementById("section-title"), document.getElementById("inner-content").firstElementChild, document.getElementById("returnHome"), document.getElementById("chapter-contents"));
getData(textbookID, (data)=>{
  book.setBookData(data);
  book.setPosition({chapter:chapter,section:0,paragraph:0,sentence:0})
})



/**/
