from flask import Flask, send_file, render_template, abort, send_from_directory, jsonify
from PIL import Image
import urllib.request
import requests 
import os, threading, json, glob, queue
app = Flask(__name__)

AWESOME_LOCS = [
  [-26.938312,-68.74491499999999],
  [60.534114,-149.55007899999998],
  [60.070409,6.542388999999957],
  [30.184983,-84.72466199999997],
  [36.252972,136.90053699999999],
  [48.865937,2.312376],
  [36.2381539,137.9683151],
  [64.0444798,-16.1711884],
  [42.658402,11.633269],
  [30.3248983,35.4471292],
  [47.51075,10.390309],
  [53.043081,57.064946],
  [-8.4226166,115.3124971],
  [35.659607,139.700378],
  [50.087586,14.421231],
  [-13.165713,-72.545542],
  [41.403286,2.174673],
  [-14.251967,-170.689851],
  [33.461503,126.939297],
  [-64.731988,-62.594564],
  [27.17557,78.041462],
  [68.19649,13.53183],
  [53.2783229,107.3506844],
  [59.9387245,30.3163621],
  [40.4900264,-75.0729199],
  [14.5841104,120.9799109],
  [17.5707683,120.3886023],
  [10.6422373,122.2358045],
  [18.0619395,120.5205914],
  [17.5713349,120.3887765], 
  [0.5738293,37.5750599],
  [-1.3766622,36.7743556]
]

WIDTHS = [ 416, 832, 1664, 3328, 6656, 13312 ]
HEIGHTS = [ 416, 416, 832, 1664, 3328, 6656 ]
LEVELSW = [ 1, 2, 4, 7, 13, 26 ]
LEVELSH = [ 1, 1, 2, 4, 7, 13 ]


ROOT_FOLDER = "./images/"

X_RANGE = range(0,7)
Y_RANGE = range(0,3)

ZOOM = 3

def equirect(zoom):
    global X_RANGE, Y_RANGE

    width = WIDTHS[zoom]
    height = HEIGHTS[zoom]
    cols = LEVELSW[zoom]
    rows = LEVELSH[zoom]
    squareW = 512
    squareH = 512

    X_RANGE = range(0,cols)
    Y_RANGE = range(0,rows)

    return {
        'columns': cols,
        'rows': rows,
        'tileWidth': squareW,
        'tileHeight': squareH,
        'width': width,
        'height': height
    }


class ThreadUrl(threading.Thread):
  def __init__(self, myQueue):
    threading.Thread.__init__(self)
    self.myQueue = myQueue
 
  def run(self):
    while True:
        (panoid,X,Y) = self.myQueue.get()
        url = _format_tile(panoid, X, Y)
        input_image = ROOT_FOLDER + str(panoid)+'-'+str(X)+'-'+str(Y)+".png"
        urllib.request.urlretrieve(url,input_image)
        self.myQueue.task_done()
 

def download_all_img(data):
    myQueue = queue.Queue()

    for i in range(len(data)):
        t = ThreadUrl(myQueue)
        t.setDaemon(True)
        t.start()
    for datum in data:
        myQueue.put(datum)

    myQueue.join()


def _format_id(panoid):
    return 'http://maps.google.com/cbk?output=json&cb_client=apiv3&v=4&dm=1&pm=1&ph=1&hl=en&panoid=' + panoid

def _format_loc(lat, lng, rad):
    return 'https://cbks0.google.com/cbk?cb_client=apiv3&authuser=0&hl=en&output=polygon&it=1%3A1&rank=closest&ll=' + str(lat)+ ',' + str(lng) + '&radius=' + str(rad)

def _format_tile(panoid, x, y):
    return 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + str(panoid) + '&output=tile&x=' + str(x) + '&y=' + str(y) + '&zoom=' + str(ZOOM) + '&nbt&fover=2'


def get_panoid_by_loc(lat,lng):
    '''
        return panoid from location, False if not found
    '''
    r = requests.get(_format_loc(lat,lng,400))
    print(r.text)
    if r.text == '{}': return False
    return json.loads(r.text)['result'][0]['id']

def get_links_by_panoid(panoid):
    '''
        returns the linked panoid (frames), i.e. clicking the arrow button in google street view
    '''
    r = requests.get(_format_id(panoid))
    return json.loads(r.text)['Links']


def stitch(data):
    '''
        stitch tiles together and save a stitched file
    '''
    rect = equirect(ZOOM)
    images = [Image.open(ROOT_FOLDER +str(panoid)+'-'+str(X)+'-'+str(Y)+".png") for (panoid, X, Y) in data ]
    total_size = (rect['width'], rect['height'])
    stitched = Image.new('RGB', total_size)
    panoid = data[0][0]
    for (datum, im) in zip(data, images):
        (panoid, x, y) = datum
        stitched.paste(im=im, box=(512*x,512*y))

    fname = ROOT_FOLDER + 'stitched-'+panoid+'.png'

    stitched.save(fname)


@app.route('/location/<lat>/<lng>')
def api(lat,lng):
    '''
        GET the equirectangular streetview image at location
    '''
    panoid = get_panoid_by_loc(lat,lng)
    if not panoid:
      abort(404)
    output_image = ROOT_FOLDER + 'stitched-'+panoid+'.png'
    if os.path.exists(output_image):
        pass
    else:
        data = [(panoid,X,Y) for X in X_RANGE for Y in Y_RANGE]
        download_all_img(data)
        stitch(data)
    return send_file(output_image)

@app.route('/panoid/<panoid>')
def panoid_get(panoid):
    '''
        downloads equirectangular streetview image at panoid
        http://localhost:5000/panoid/DtaclnuEVvssSuojH8CPpw
    '''
    output_image = ROOT_FOLDER + 'stitched-'+panoid+'.png'
    if os.path.exists(output_image):
        pass
    else:
        data = [(panoid,X,Y) for X in X_RANGE for Y in Y_RANGE]
        download_all_img(data)
        stitch(data)
    return send_file(output_image)


@app.route('/next/<panoid>')
def get_next_linked_panoid(panoid):
    '''
        GET the next panoid

        http://localhost:5000/next/DtaclnuEVvssSuojH8CPpw
    '''
    return jsonify(get_links_by_panoid(panoid))

def init():
    equirect(ZOOM)

@app.route('/images/<path:path>')
def send_static(path):
    return send_from_directory('images', path)


@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('assets', path)

@app.route('/')
def index():
    return render_template('viewer.jinja2')

if __name__ == "__main__":
    init()
    app.run('127.0.0.1','5000')

    # panoid = get_panoid_by_loc(AWESOME_LOCS[0][0],AWESOME_LOCS[0][1])
    # data = [(panoid,X,Y) for X in X_RANGE for Y in Y_RANGE]
    # download_all_img(data)
    # stitch(data)
    get_links_by_panoid(panoid)