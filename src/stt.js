
var paragraph_list = ["I have a dream that one day this nation will rise",
                      "up and live out the true meaning of its creed",
                      "We hold these truths to be self-evident",
                      "that all men are created equal.",]

var unimportant_words = new Set('i','is','was','am','are','a','and','the');


// instantiate recognition
var recognition = new webkitSpeechRecognition(); //Chrome supports webkit prefixed, firefox doesn't
recognition.continuous = true; // doesn't turn off recognition during pause
recognition.interimResults = true; // can see the interim results

//global vars
var curr_paragraph; //index
var input_set; //all words said by user
var input_set_size_past; //size of set at previous check
var conf_score; //accuracy of input compared to master paragraph
var conf_score_past; //accuracy of input at previous check
var total_results; //num of times the user has spoken
var total_results_past; //num of times at previous check
var restart_recog; //true so that recording doesn't stop
var speech_pause_timer; //check if user is speaking
var text_to_speech;

initialize();

// instantiate
function initialize(){
  curr_paragraph = 0;
  input_set = new Set();
  input_set_size_past = 0;
  conf_score = 0;
  conf_score_past = 0;
  total_results = 0;
  total_results_past = 0;
  restart_recog = true;

  recognition.start();
  startTimer();
  window.addEventListener('startTimer', startTimer)

  document.body.onkeyup = function(e){
    if(e.keyCode == 32){ // spacebar press
        next_frame();
    }
  }
  document.body.onkeyup = function(e){
    if(e.keyCode == 90){ // z press
        initialize();
    }
  }
  if( isMobile.any() ){ // user device is mobile
    document.body.ontouchstart = function(e){ // screen touch
      initialize();
    }
  }
}

recognition.onresult = function(event) {
  total_results++;
  //list of recognized phrases, split by pauses. If the phrase is final, add to perm string
  for(var i = event.resultIndex; i < event.results.length; ++i) {
    var input_split = event.results[i][0].transcript.toLowerCase().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").split(" ")
    for(let j=0; j<input_split.length; j++){
      if(! unimportant_words.has(input_split[j])){
        input_set.add(input_split[j])
      }
    }
  }

  let input_set_size = input_set.size
  console.log("size:",input_set_size)
  if( input_set_size>input_set_size_past){
    input_set_size_past = input_set_size;
    conf_score = calc_conf_score(input_set, paragraph_list[curr_paragraph]);
    // let conf = calc_conf_score(perm_trans, paragraph_list[curr_paragraph]);
    console.log(conf_score);
    if(conf_score >= 0.6) {
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
  var event = new Event('startTransition');
  window.dispatchEvent(event);

  console.log("Achieved confidence interval");

  curr_paragraph++;
  input_set = new Set();
  input_set_size_past = 0;
  total_results = 0;
  total_results_past = 0;
  conf_score = 0;
  conf_score_past = 0;
}

var flip = false; //check if better score when true, so every other time

function check_if_update(){
  if(total_results_past == total_results){
    read_speech("Here's a hint. You're supposed to say: " + paragraph_list[curr_paragraph])
  } else{
    if(flip){
      if(conf_score == conf_score_past){
        read_speech("You seem lost. You're supposed to say: " + paragraph_list[curr_paragraph])
      }
      conf_score_past = conf_score
    }
  }
  total_results_past = total_results
  flip = !flip;
}

function read_speech(text){
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
}

function startTimer(){
  speech_pause_timer = setInterval(check_if_update, 4000);
}

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
