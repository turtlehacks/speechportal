#!/usr/bin/python

import requests
import json

my_token = "869876a61b284295a80946f428d1fce8"
ENTITY_URL = 'https://api.dandelion.eu/datatxt/nex/v1'

def get_entities(text, confidence=0.01, lang='en'):
    payload = {
        'token': my_token,
        'text': text,
        'confidence': confidence,
        'lang': lang,
        'social.hashtag': True,
        'social.mention': True
    }
    response = requests.get(ENTITY_URL, params=payload)
    return response.json()
 
def print_entities(data):
    for annotation in data['annotations']:
        print("Entity found: %s" % annotation['spot'])
 
def get_dump(query):
    response = get_entities(query)
    print(json.dumps(response, indent=2))

get_dump("I just wanted to begin by mentioning that the nominee for secretary of the Department of Labor will be Mr. Alex Acosta. He has a law degree from Harvard Law School, was a great student; former clerk for Justice Samuel Alito. And he has had a tremendous career. He’s a member and has been a member of the National Labor Relations Board, and has been through Senate confirmation three times, confirmed; did very, very well.")
