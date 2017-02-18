// import str from "./content.js";


window.current_panoid = '';

function init() {
    const init_panoid = "DtaclnuEVvssSuojH8CPpw";
    setSky(init_panoid);
}

function setSky(panoid){
    const sky = document.querySelector('a-sky');
    sky.setAttribute('src', "http://localhost:5000/panoid/" + panoid);
    window.current_panoid = panoid;
}

function updateSky(){
    fetch("http://localhost:5000/next/" + window.current_panoid)
    .then(
      (res) =>  res.json()
    ).then((json) => {
        // alert("FUCK")
      console.log('parsed json', json);
      // alert(json[0]['panoId']);
      setSky(json[1]['panoId']);
    }).catch((ex) => {
      console.log('parsing failed', ex)
    })

}

window.onload = function() {
    init();
    setInterval(updateSky, 100);
};