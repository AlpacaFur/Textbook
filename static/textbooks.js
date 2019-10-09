let currentId;

fetch("/textbooks/textbook_registry.json")
  .then(res=>res.json())
  .then((data)=>{
    createTextbooks(data)
  })

function createTextbooks(data) {
  let fragment = document.createDocumentFragment()
  data.textbooks.forEach((id)=>{
    let div = document.createElement("div")
    let img = document.createElement("img")
    img.src = `textbooks/${id}/cover.png`
    div.appendChild(img);
    div.classList.add("textbook")
    fragment.appendChild(div);
    div.addEventListener("click", ()=>{loadBook(id)})
  })
  document.getElementById("textbook_list").appendChild(fragment);
}

function loadBook(id) {
  console.log(id)
  if (currentId === id) {
    document.getElementById("details").classList.remove("show");
    currentId = null;
    return;
  }
  currentId = id;
  fetch(`/textbooks/${id}/meta.json`)
    .then(res=>res.json())
    .then((data)=>{
      document.getElementById("bookTitle").textContent = data.name;
      let frag = document.createDocumentFragment()
      Object.values(data.chapter_names).forEach((name, index)=>{
        let p = document.createElement("p");
        p.textContent = name;
        p.addEventListener("click", ()=>{
          document.body.classList.add("fadeout");
          setTimeout(()=>{
            window.location = `/read?bookID=1&chapter=${index}`;
          }, 1000)
        })
        frag.appendChild(p);
      })
      let chapters = document.getElementById("chapters");
      while (chapters.firstChild) {
        chapters.removeChild(chapters.firstChild);
      }
      chapters.appendChild(frag)
      document.getElementById("details").classList.add("show")
    })
}
