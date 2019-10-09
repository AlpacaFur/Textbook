const settingsManifest = {
  display: {
    theme: "auto",
  },
}

let settings = new Settings(settingsManifest);

settings.listen("display.theme", (value)=>{
  document.body.setAttribute("data-theme", value)
})

document.getElementById("returnHome").addEventListener("click", ()=>{window.location.pathname = ""})

let settingsContainer = document.getElementById("settingsContainer")
document.getElementById("openSettings").addEventListener("click", ()=>{
  settingsContainer.classList.add("show");
})
document.getElementById("closeSettings").addEventListener("click", ()=>{
  settingsContainer.classList.remove("show");
})

function getData(callback) {
  let data = fetch("/textbooks/1/meta.json", {})
    .then(res=>res.json())
    .then(data=>callback(data))
}

document.addEventListener("keydown", (event)=>{
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
getData((data)=>{
  book.setBookData(data);
  book.setPosition({chapter:0,section:0,paragraph:0,sentence:0})
})



/**/
