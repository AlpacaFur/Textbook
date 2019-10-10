class Book {
  constructor(titleElem, contentElem, chapterTitle, chapterElem) {
    // Manifest data
    this.bookData = false;

    this.position = {chapter:-1, section:-1, paragraph:-1, sentence:-1};

    this.loadedChapters = {}
    this.chapterData = [];
    this.section = [];
    this.sentences = [];

    /* Element References */
    this.titleElem = titleElem;
    this.contentElem = contentElem;
    this.chapterTitle = chapterTitle;
    this.chapterElem = chapterElem;

  }
  _getChapter(chapterNumber, callback) {
    if (!this.bookData) throw new Error("Can't set the position of an unknown book!");
    if (!this.bookData.chapters[chapterNumber]) throw new Error(`Chapter number ${chapterNumber} doesn't exist!`);
    if (this.loadedChapters[chapterNumber]) {
      callback(this.loadedChapters[chapterNumber])
    }
    else {
      fetch(`/textbooks/${this.bookData.id}/chapters/${this.bookData.chapters[chapterNumber]}.json`)
      .then(res=>res.json())
      .then((data)=>{
        this.loadedChapters[chapterNumber] = data;
        if (callback) callback(data);
      })
    }
  }
  _lastSentence(position) {
    return this._sentenceSplit(this.chapterData.content[position.section].content[position.paragraph].content).length-1
  }
  _sentenceSplit(value) {
    return value.split(/[\.\!\?%] (?![\.\?\!%] ?$)/)
  }
  setBookData(bookManifest) {
    this.bookData = bookManifest;
  }
  setPosition(position) {
    if (!this.bookData) throw new Error("Can't set the position of an unknown book!")
    if (!this.position) throw new Error("Position is a required argument!")
    this.loadChapter(position);
  }
  forward() {
    if (this.sentences.length-1 > this.position.sentence) {
      this.contentElem.children[this.position.sentence].classList.remove("selected");
      this.position.sentence++;
      this.contentElem.children[this.position.sentence].scrollIntoView({block:"end",behavior:"smooth"});
      this.contentElem.children[this.position.sentence].classList.add("selected");
    }
    else {
      if (this.section.content.length-1 > this.position.paragraph) {
        this.position.paragraph += 1;
        this.position.sentence = 0;
        this._loadData(this.chapterData, this.position);
      }
      else if (this.chapterData.content.length-1 > this.position.section) {
        this.position.section += 1;
        this.position.paragraph = 0;
        this.position.sentence = 0;
        this._loadData(this.chapterData, this.position);
      }
      else if (this.bookData.chapters[this.position.chapter+1]) {
        this.position.chapter += 1;
        this.position.section = 0;
        this.position.paragraph = 0;
        this.position.sentence = 0;
        this.loadChapter(this.position)
      }
    }
  }
  backward() {
    if (this.position.sentence > 0) {
      this.contentElem.children[this.position.sentence].classList.remove("selected");
      this.position.sentence--;
      this.contentElem.children[this.position.sentence].scrollIntoView({block:"end",behavior:"smooth"});
      this.contentElem.children[this.position.sentence].classList.add("selected");
    }
    else {
      if (this.position.paragraph > 0) {
        this.position.paragraph -= 1;
        this.position.sentence = this._lastSentence(this.position)
        this._loadData(this.chapterData, this.position);
      }
      else if (this.position.section > 0) {
        this.position.section -= 1;
        this.position.paragraph = this.chapterData.content[this.position.section].content.length - 1 ;
        this.position.sentence = this._lastSentence(this.position);
        this._loadData(this.chapterData, this.position);
      }
      else if (this.bookData.chapters[this.position.chapter-1]) {
        this.position.chapter -= 1;
        this._getChapter(this.position.chapter, (data)=>{
          this.chapterData = data;
          this.position.section = data.content.length-1;
          this.position.paragraph = data.content[this.position.section].content.length - 1;
          this.position.sentence = this._lastSentence(this.position);
          this.loadChapter(this.position)
        })
      }
    }
  }
  render() {
    this.titleElem.textContent = this.section.name;
    let fragment = document.createDocumentFragment();
    let focusedSentence = this.position.sentence;
    this.sentences.forEach((sentence, index)=>{
      let imgMatch = sentence.match(/^%(.+)%?$/)
      if (imgMatch) {
        let [src, caption] = imgMatch[1].split("|")
        let div = document.createElement("div");
        let img = document.createElement("img");
        img.src = `/textbooks/${this.bookData.id}/images/${src}`;
        img.setAttribute("caption", caption);
        div.appendChild(img);
        let p = document.createElement("p");
        p.textContent = caption;
        div.appendChild(p);
        div.classList.add("imgdiv")
        if (index === focusedSentence) div.classList.add("selected");
        fragment.appendChild(div);
        img.addEventListener("click", ()=>{img.classList.toggle("supersize")})
      }
      else {
        let span = document.createElement("span");
        span.textContent = sentence;
        if (index === focusedSentence) span.classList.add("selected");
        fragment.appendChild(span);
      }
    })
    let elem = [0];
    Array.from(this.chapterElem.querySelectorAll(".active")).forEach((elem)=>{
      let parentindex = this._getChildIndex(elem.parentNode);
      if (elem.classList.contains("subsection")) {
        let index = this._getChildIndex(elem);
        if (!(this.position.paragraph+1 === index && this.position.section === parentindex)) elem.classList.remove("active")
      }
      else {
        if (!(this.position.section === parentindex)) elem.classList.remove("active");
      }
    })
    this.chapterElem.children[this.position.section].children[0].classList.add("active")
    this.chapterElem.children[this.position.section].children[this.position.paragraph+1].classList.add("active")
    this._removeChildren(this.contentElem);
    this.contentElem.appendChild(fragment);
    setTimeout(()=>{
      this.contentElem.children[this.position.sentence].scrollIntoView({block:"end",behavior:"smooth"});
    }, 250)

  }
  _getChildIndex(element) {
    return Array.prototype.indexOf.call(element.parentNode.children, element);
  }
  _removeChildren(element) {
    while (element.childNodes.length > 0) {
      element.removeChild(element.firstChild);
    }
  }
  _loadData(data = this.chapterData, position = this.position) {
    this.section = data.content[position.section];
    let sentences = this._sentenceSplit(this.section.content[position.paragraph].content);
    this.sentences = sentences.map((str, ind)=>{return (ind === sentences.length-1 || str.startsWith("%")) ? str : str+". "})
    this.position = position;
    this.render()
  }
  _displayChapter() {
    let data = this.chapterData;
    this.chapterTitle.textContent = data.name;
    this.chapterTitle.classList.add("pulse");
    setTimeout(()=>{this.chapterTitle.classList.remove("pulse")}, 1000)

    this._removeChildren(this.chapterElem);
    let fragment = document.createDocumentFragment();
    data.content.forEach((section, index)=>{
      let div = document.createElement("div")
      let p = document.createElement("p")
      p.textContent = section.name;
      p.addEventListener("click", ()=>{
        this.position.section = index;
        this.position.paragraph = 0;
        this.position.sentence = 0;
        this._loadData(data, this.position)
      })
      div.appendChild(p)
      section.content.forEach((paragraph, para_index)=>{
        let subp = document.createElement("p");
        subp.textContent = paragraph.name || "UNDEFINED!";
        subp.classList.add("subsection");
        subp.addEventListener("click", ()=>{
          this.position.section = index;
          this.position.paragraph = para_index;
          this.position.sentence = 0;
          this._loadData(data, this.position)
        })
        div.appendChild(subp)
      })
      fragment.appendChild(div);
    })
    this.chapterElem.appendChild(fragment);
  }
  _changeSection(sectionPos) {
    let data = this.chapterData;
    this.position.section = sectionPos;
    this.position.paragraph = 0;
    this.position.sentence = 0;
    this._loadData(data, this.position);
  }
  loadChapter(newPosition) {
    this._getChapter(newPosition.chapter, (data)=>{
      this.chapterData = data;
      this._displayChapter();
      this._loadData(data, newPosition)
    })
  }
}
