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
'nBLnNFZ-voV1RiWgryQd6w',
]



function init() {
    const init_panoid = "Jf1XdypK_M7bjLeY1N581g";
    setHDSky(init_panoid);
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

function startTransition(to){

  var transition = setInterval(()=>updateSky(), 100);

  setTimeout(()=>{
    clearInterval(transition);
//    setHDSky(window.current_panoid);

    setBGTransparent();

    setTimeout(()=>{
      setHDSky(places[COUNTER]);
      COUNTER++;
      setTimeout(()=>{
        unsetBGTransparent();
        var event = new Event('startTimer');
        window.dispatchEvent(event);
      },1500);
    }, 1000);
  }, 5000);
}


window.onload = function() {
    require('./stt.js');
    init();
    window.addEventListener('startTransition', startTransition);
};
