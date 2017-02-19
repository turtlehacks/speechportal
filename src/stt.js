
var paragraph_list = ["This is why I am the chicken. I am truly, truly a fire dog. Honestly.",
    "DONALD TRUMP IS MY FUCKING IDOL.",
    "Dream on apples, my favorite chipmunk isn't Alvin, it's Gerald."]
var unimportant_words = new Set('i','is','was','am','are','a','and','the');


// instantiate recognition
var recognition = new webkitSpeechRecognition();
recognition.continuous = true; // doesn't turn off recognition during pause
recognition.interimResults = true; // can see the interim results

//gobal vars
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
  conf_score =0;
  conf_score_past =0;
  total_results = 0;
  total_results_past = 0;
  restart_recog = true;

  recognition.start();
  speech_pause_timer = setInterval(check_if_update, 7000);
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
    if(conf_score >= 0.8) {
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
  let num_words_paragraph = master_paragraph_split.length;

  for(var i = 0; i < master_paragraph_split.length; i++){
    if (input_set.has(master_paragraph_split[i])){
      num_same_words++;
    }
  }
  return (num_same_words / num_words_paragraph);
}

// Resets the input for the next line
function next_frame(){

  var event = new Event('startTransition');
  window.dispatchEvent(event);

  console.log("ACHIEVED 80% CONFIDENCE: GOING TO A NEW LINE");

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
    console.log("you've said nothing")
    read_speech("Here's a hint. You're supposed to say: "+paragraph_list[curr_paragraph])
  } else{
    if(flip){
      if(conf_score == conf_score_past){
        console.log("you're not following the speech")
        read_speech("You seem lost. You're supposed to say: "+paragraph_list[curr_paragraph])
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
    speech_pause_timer = setInterval(check_if_update, 7000);
  }
  window.speechSynthesis.speak(text_to_speech);
}
