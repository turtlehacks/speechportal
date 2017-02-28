# SpeechPortal 
----------------

## Installation

```
virtualenv -p python3 .env
source .env/bin/activate
pip install -r requirements.txt

npm install webpack -g

mkdir images assets
python serve.py
```

## Inspiration
Over the course of human history, formal speech has proven to be the singly most powerful way to communicate a message to a group of people. Whether you're a Ph.D student studying in Korea, or a refugee escaping Syria, you will find yourself having to give a speech at some point in your life. And whether it's about defending the past five years of your research or desperately seeking for help for your younger siblings still at home, preparing for that important speech can be difficult, tedious, and nervewracking.

And as college students who have had to give speeches to protect their school programs, to inspire suffering communities, and to defend others from bigotry, we believe everyone should have the essential human ability to communicate to others.

That's why we built SpeechPortal, to make preparing for your next speech fun, easy, and intuitive! Using novel webVR and in-browser speech recognition technology, SpeechPortal creates a dynamic training ground for people who need to quickly and intelligently memorize their next talk! Accessible to anyone with a mobile phone, computer!

## What it does
SpeechPortal is a webVR app that produces a dynamic virtual memory palace made up of memorable Google Streetview locations that holds image clues generated from an inputted speech. Once you use the clues around you to help you recite the first portion of your speech, the speech-processing portion of our project advances you to the next location (and paragraph in your speech), and will wait to give you a 'hint' if you hesitate/say the wrong thing.

## How we built it
We used Python and Flask to serve as a container to host the VR environment, a multithreaded Python script to download streetview images onto an SSD server, WebVR/OpenGL technologies for VR rendering, and Javascript to render the auditory processing, perform image stitching, and perform secondary VR processing client-side. We made extensive use of Google Street View Image API and Web Speech API (supported by Google speech processing). On the NLP side, we used NLTK to broke down the speech into sections and extract keywords/phrases, and for each keyword, we found a related image using Unsplash.

Check out the repo at: https://github.com/rickyhan/speechvr

## Challenges we ran into
Each VR frame of Google Street view contains a massive amount of data, which we had to resolve using parallel image downloads and non-blocking compressions on an SSD server in order to allow fast mobile rendering.

## Built With
python
javascript
google-web-speech-api
nltk
flask
opengl
google-streetview

## Try it out
[0b01.com](Temporary Host)
