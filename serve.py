from flask import Flask, send_file, render_template, abort
from StringIO import StringIO
import urllib, cStringIO
from PIL import Image
import urllib
import requests 
import os, multiprocessing, Queue, threading, json, glob


awesome_locs = [
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

widths = [ 416, 832, 1664, 3328, 6656, 13312 ]
heights = [ 416, 416, 832, 1664, 3328, 6656 ]
levelsW = [ 1, 2, 4, 7, 13, 26 ]
levelsH = [ 1, 1, 2, 4, 7, 13 ]


app = Flask(__name__)
ALLOWED_HOSTS = ['deepstreetview.com']
ROOT_FOLDER = "./static/"

x_range = range(0,7)
y_range = range(0,3)

zoom = 3

def equirect(zoom):
    global x_range, y_range

    width = widths[zoom]
    height = heights[zoom]
    cols = levelsW[zoom]
    rows = levelsH[zoom]
    squareW = 512
    squareH = 512

    x_range = range(0,cols)
    y_range = range(0,rows)

    return {
        'columns': cols,
        'rows': rows,
        'tileWidth': squareW,
        'tileHeight': squareH,
        'width': width,
        'height': height
    }


def _format_tile(panoid, x, y):
    return 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + str(panoid) + '&output=tile&x=' + str(x) + '&y=' + str(y) + '&zoom=' + str(zoom) + '&nbt&fover=2'

class ThreadUrl(threading.Thread):
  def __init__(self, queue):
    threading.Thread.__init__(self)
    self.queue = queue
 
  def run(self):
    while True:
        (panoid,X,Y) = self.queue.get()
        url = _format_tile(panoid, X, Y)
        input_image = ROOT_FOLDER + str(panoid)+'-'+str(X)+'-'+str(Y)+".png"
        urllib.urlretrieve(url,input_image)
        self.queue.task_done()
 

def download_all_img(data):
    queue = Queue.Queue()

    for i in range(len(data)):
        t = ThreadUrl(queue)
        t.setDaemon(True)
        t.start()
    for datum in data:
        queue.put(datum)

    queue.join()


def _format_id(panoid):
    return 'http://maps.google.com/cbk?output=json&cb_client=apiv3&v=4&dm=1&pm=1&ph=1&hl=en&panoid=' + panoid

def _format_loc(lat, lng, rad):
    return 'https://cbks0.google.com/cbk?cb_client=apiv3&authuser=0&hl=en&output=polygon&it=1%3A1&rank=closest&ll=' + str(lat)+ ',' + str(lng) + '&radius=' + str(rad)

def get_panoid_by_loc(lat,lng):
    r = requests.get(_format_loc(lat,lng,400))
    print r.text
    if r.text == '{}': return False
    return json.loads(r.text)['result'][0]['id']

def get_links_by_panoid(panoid):
    r = requests.get(_format_id(panoid))
    print json.loads(r.text)['Links']


def stitch(data):
    rect = equirect(zoom)
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
    panoid = get_panoid_by_loc(lat,lng)
    if not panoid:
      abort(404)
    output_image = ROOT_FOLDER + 'stitched-'+panoid+'.png'
    if os.path.exists(output_image):
        pass
    else:
        data = [(panoid,X,Y) for X in x_range for Y in y_range]
        download_all_img(data)
        stitch(data)
    # for filename in os.listdir('./static'):
    #     if not filename.startswith('stitched'):
    #         os.remove(filename)
    return send_file(output_image)

def init():
    equirect(zoom)


@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/')
def index():
    return render_template('viewer.jinja2')

if __name__ == "__main__":
    init()
    app.run('127.0.0.1','5000')

    # panoid = get_panoid_by_loc(awesome_locs[0][0],awesome_locs[0][1])
    # data = [(panoid,X,Y) for X in x_range for Y in y_range]
    # download_all_img(data)
    # stitch(data)
    get_links_by_panoid(panoid)