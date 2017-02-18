window.current_panoid = '';

function init() {
    const init_panoid = "Jf1XdypK_M7bjLeY1N581g";
    setSky(init_panoid);
}

function setSky(panoid){
    const sky = document.querySelector('a-sky');
    sky.setAttribute('src', document.location.origin + "/panoid/" + panoid);
    window.current_panoid = panoid;
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

window.onload = function() {
    init();
    setInterval(updateSky, 1000);
};
