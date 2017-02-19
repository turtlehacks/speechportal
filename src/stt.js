var isMobile = { // check if user device is mobile
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

window.paragraph_list = [
  "Some say the world will end in fire, Some say in ice.",
  "From what I’ve tasted of desire, I hold with those who favor fire.",
  "But if it had to perish twice, I think I know enough of hate",
  "To say that for destruction ice, Is also great and would suffice."]

var unimportant_words = new Set('i','is','was','am','are','a','and','the');


// instantiate recognition
var recognition = new webkitSpeechRecognition(); //Chrome supports webkit prefixed, firefox doesn't
recognition.continuous = true; // doesn't turn off recognition during pause
recognition.interimResults = true; // can see the interim results

document.body.onkeydown = function(e){
  if(e.keyCode == 32){ // spacebar press
      next_frame();
  }
  if(e.keyCode == 90){ // z press
      resetAll();
  }
}

if( isMobile.any() ){ // user device is mobile
  document.querySelector("canvas").ontouchstart = function(e){ // screen touch
    next_frame();
  }
}

//global vars
window.curr_paragraph; //index
var input_set; //all words said by user
var input_set_size_past; //size of set at previous check
var conf_score; //accuracy of input compared to master paragraph
var conf_score_past; //accuracy of input at previous check
var total_results; //num of times the user has spoken
var total_results_past; //num of times at previous check
var restart_recog; //true so that recording doesn't stop
var speech_pause_timer; //check if user is speaking
var text_to_speech;
var conf_cuttoff = 0.7; // when to move to next line
var reading;

initialize();

// instantiate
function initialize(){
  window.curr_paragraph = 0;
  input_set = new Set();
  input_set_size_past = 0;
  conf_score = 0;
  conf_score_past = 0;
  total_results = 0;
  total_results_past = 0;
  restart_recog = true;
  reading = false;

  recognition.start();
  setTimeout(()=>{
    startTimer();
  },5000);
  window.addEventListener('startTimer', startTimer);

}

recognition.onresult = function(event) {
  total_results++;
  //list of recognized phrases, split by pauses. If the phrase is final, add to perm string
  for(var i = event.resultIndex; i < event.results.length; ++i) {
    var input_raw = event.results[i][0].transcript.toLowerCase().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ")
    var input_split = input_raw.split(" ")
    for(let j=0; j<input_split.length; j++){
      if(! unimportant_words.has(input_split[j])){
        input_set.add(input_split[j])
      }
    }
//    if(input_raw.includes("portal help")){
//      read_speech("Ok! Help you say: " + window.paragraph_list[window.curr_paragraph]);
//      break;
//    }
  }

  let input_set_size = input_set.size
  console.log("size:",input_set_size)
  if( input_set_size>input_set_size_past){
    input_set_size_past = input_set_size;
    conf_score = calc_conf_score(input_set, window.paragraph_list[window.curr_paragraph]);
    // let conf = calc_conf_score(perm_trans, window.paragraph_list[curr_paragraph]);
    console.log(conf_score);
    if(conf_score >= conf_cuttoff) {
      next_frame();
    }
  }
}

recognition.onend = function(event){
  console.log("Restart: "+restart_recog+event)
  if(restart_recog){
    recognition.start();
  }
}

// Calculates how close two strings are to each other
function calc_conf_score(input_set, master_paragraph){

  let num_same_words = 0;
  // clean string and split by spaces
  let master_paragraph_split = master_paragraph.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").split(" ");
  let master_paragraph_split_filtered = master_paragraph_split.filter((x)=>!unimportant_words.has(x));
  let num_words_paragraph = master_paragraph_split_filtered.length;

  for(var i = 0; i < master_paragraph_split_filtered.length; i++){
    if (input_set.has(master_paragraph_split_filtered[i])){
      num_same_words++;
    }
  }
  return (num_same_words / num_words_paragraph);
}

// Resets the input for the next line
function next_frame(){
  clearInterval(speech_pause_timer);
  if(window.curr_paragraph<window.paragraph_list.length-1){
    window.curr_paragraph++;
  } else{
    resetAll();
    return;
  }
  var event = new CustomEvent('startTransition', {"text":window.paragraph_list[window.curr_paragraph]});
  window.dispatchEvent(event);

  console.log("Achieved confidence interval");

  input_set = new Set();
  input_set_size_past = 0;
  total_results = 0;
  total_results_past = 0;
  conf_score = 0;
  conf_score_past = 0;
  reading = false;
}

var flip = false; //check if better score when true, so every other time

function check_if_update(){
  if(total_results_past == total_results){
    read_speech("Here's a hint. You're supposed to say: " + window.paragraph_list[window.curr_paragraph])
  } else{
    if(flip){
      if(conf_score == conf_score_past){
        read_speech("You seem lost. You're supposed to say: " + window.paragraph_list[window.curr_paragraph])
      }
      conf_score_past = conf_score
    }
  }
  total_results_past = total_results
  flip = !flip;
}

function read_speech(text){
  if(reading) return;
  reading = true;
  clearInterval(speech_pause_timer);
  restart_recog = false;
  recognition.stop();
  text_to_speech = new SpeechSynthesisUtterance(text);
  text_to_speech.onend = function(event){
    restart_recog = true;
    recognition.start();
    startTimer();
  }
  window.speechSynthesis.speak(text_to_speech);
  reading = false;
}

function startTimer(){
  clearInterval(speech_pause_timer);
  speech_pause_timer = setInterval(check_if_update, 4000);
}

function resetAll(){
  // initialize();
  // init();
  window.location.href="/viewer";
}
