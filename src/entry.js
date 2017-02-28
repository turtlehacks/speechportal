window.current_panoid = '';

var COUNTER = 0;

const places = [
'ABqudn7qGGDzdu-3HZFuZw',
'E9JGW1q48jvgvFkjx0kYjw',
'ocuWPJcOa4FUFc_pxh0fNQ',
'_znQ1nR9o95RXrK1kEwP0Q',
'BXw6CgL5yxDtsFlLJ_AdUw',
'EVUfulQv-D5ypQwXKoF-hA',
'_fFPxZTrOI7MHyReJhWung',
]

const xPosValues = [0, -2.5, 2.5, -4, 4]; //picture x positions
const zPosValues = [1,2,2,2,2];
const yRotValues = [0, 50, -50, 40, -40];


function init() {
    const init_panoid = "Jf1XdypK_M7bjLeY1N581g";
    setHDSky(init_panoid);

    fetch(document.location.origin+'/nouns/'+window.paragraph_list[window.curr_paragraph])
    .then((resp)=>resp.json())
    .then(insertImgs)
    .catch(console.error)

}

function setSky(panoid){
    const sky = document.querySelector('a-sky');
    sky.setAttribute('src', document.location.origin + "/panoid/" + panoid);
    window.current_panoid = panoid;
}
function setHDSky(panoid){
    const sky = document.querySelector('a-sky');
    sky.setAttribute('src', document.location.origin + "/keypanoid/" + panoid);
    window.current_panoid = panoid;
}
function setBGTransparent(){
    const sky = document.querySelector('a-sky');
    sky.setAttribute('opacity', '0');
    sky.setAttribute('color', '#fff');
}

function unsetBGTransparent(){
    const sky = document.querySelector('a-sky');
    sky.setAttribute('opacity', '1');
    sky.setAttribute('color', '#fff');
}

function updateSky(){
    fetch(document.location.origin + "/next/" + window.current_panoid)
    .then(
      (res) =>  res.json()
    ).then((json) => {
      var sorted = json.sort((a,b)=>a.yawDeg - b.yawDeg)
      setSky(sorted[0].panoId);
    }).catch((ex) => {
      console.log('parsing failed', ex)
    })
}

function insertImgs(srcs){
  console.log(srcs)
  var scene = document.querySelector('a-scene');
  srcs.forEach((src,i)=>{
    var img = document.createElement('a-image');
    img.setAttribute('src', src);
    img.setAttribute('position', xPosValues[i] + ' ' + 2 + ' ' + zPosValues[i] );
    img.setAttribute('rotation', 0 + ' ' + yRotValues[i] + ' ' + 0 );
    scene.appendChild(img);
  });
}

function deleteImgs(){
  var imgs = document.querySelectorAll('a-image');
  if(imgs){
    for(let i=0; i<imgs.length; i++){
      imgs[i].parentNode.removeChild(imgs[i]);
    }
  }

}

function startTransition(){

  var transition = setInterval(()=>updateSky(), 100);
  deleteImgs();

  setTimeout(()=>{
    clearInterval(transition);
//    setHDSky(window.current_panoid);

    setBGTransparent();

    setTimeout(()=>{
      setHDSky(places[COUNTER]);
      COUNTER++;
      setTimeout(()=>{
        unsetBGTransparent();

        fetch(document.location.origin+'/nouns/'+window.paragraph_list[window.curr_paragraph])
        .then((resp)=>resp.json())
        .then(insertImgs);

        var event = new Event('startTimer');
        window.dispatchEvent(event);
      },1500);
    }, 1000);
  }, 3000);
}


window.onload = function() {
    require('./stt.js');
    init();
    window.addEventListener('startTransition', startTransition);
};
