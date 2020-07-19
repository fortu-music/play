var accessToken;
var data;
// var genre;

let video;
let detector;
let detections;
let lastDetected = "";

const mappedValues = {
	'person' 		: 'human', 
	'traffic light'		: 'traffic%20light',
	'fire hydrant'		: 'fire%20hydrant',
	'stop sign'		: 'stop%20sign',
	'parking meter'		: 'parking%20meter',
	'sports ball'		: 'sports%20ball',
	'baseball bat'		: 'baseball%20bat',
	'baseball glove'	: 'baseball%20glove',
	'tennis racket'		: 'tennis%20racket',
	'wine glass'		: 'wine%20glass',
	'potted plant'		: 'potted%20plant',
	'dining table'		: 'dining%20table',
	'tv'			: 'television',
	'hot dog'		: 'hot%20dog',	
	'cell phone'		: 'cell%20phone',
	'teddy bear'		: 'teddy%20bear',
	'hair drier'		: 'hair%20dryer',

	'bicycle' 		: 'bicycle',
	'car'			: 'car',
	'motorcycle'		: 'motorcycle',
	'airplane'		: 'airplane',
	'bus'			: 'bus',
	'train'			: 'train',
	'truck'			: 'truck',
	'boat'			: 'boat',
	'bench'			: 'bench',
	'bird'			: 'bird',
	'cat'			: 'cat',
	'dog'			: 'dog',
	'horse'			: 'horse',
	'sheep'			: 'sheep',
	'cow'			: 'cow',
	'elephant'		: 'elephant',
	'bear'			: 'bear',
	'zebra'			: 'zebra',
	'giraffe'		: 'giraffe',
	'backpack'		: 'backpack',
	'umbrella'		: 'umbrella',
	'handbag'		: 'handbag',
	'tie'			: 'tie',
	'suitcase'		: 'suitcase',
	'frisbee'		: 'frisbee',
	'skis'			: 'skis',
	'snowboard'		: 'snowboard',
	'kite'			: 'kite',
	'skateboard'		: 'skateboard',
	'surfboard'		: 'surfboard',
	'bottle'		: 'bottle',
	'cup'			: 'cup',
	'fork'			: 'fork',
	'knife'			: 'knife',
	'spoon'			: 'spoon',
	'bowl'			: 'bowl',
	'banana'		: 'banana',
	'apple'			: 'apple',
	'sandwich'		: 'sandwich',
	'orange'		: 'orange',
	'broccoli'		: 'broccoli',
	'carrot'		: 'carrot',
	'pizza'			: 'pizza',
	'donut'			: 'donut',
	'cake'			: 'cake',
	'chair'			: 'chair',
	'couch'			: 'couch',
	'bed'			: 'bed',
	'toilet'		: 'toilet',
	'laptop'		: 'laptop',
	'mouse'			: 'mouse',
	'remote'		: 'remote',
	'keyboard'		: 'keyboard',
	'microwave'		: 'microwave',
	'oven'			: 'oven',
	'toaster'		: 'toaster',
	'sink'			: 'sink',
	'refrigerator'		: 'refrigerator',
	'book'			: 'book',
	'clock'			: 'clock',
	'vase'			: 'vase',
	'scissors'		: 'scissors',
	'toothbrush'		: 'toothbrush',
	}


function setup() {

  canvas = createCanvas(480, 360);
  canvas.parent('canvas-holder');

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  detector = ml5.objectDetector('cocossd', modelReady)

  getAccessToken(function(incoming) {
    accessToken = incoming;


  });
}

function modelReady() {
  select('#modelStatus').html(' ')
  detect();
}

function detect() {
  detector.detect(video, gotResults);
}

function gotResults(err, results) {
  if (err) {
    console.log(err);
    return
  }

  detections = results;
  detect();
}

function draw() {
  image(video, 0, 0, width, height);

    
  if (detections) {
    detections.forEach(detection => {
      noStroke();
      fill(255);
      strokeWeight(2);
      text(detection.label, detection.x + 4, detection.y + 10)

      noFill();
      strokeWeight(3);
      if (detection.label === 'person') {
        stroke(44, 74, 99);
      } else {
        stroke(253, 188, 74);
      }

      console.log('detection label: ' + detection.label);
      console.log(detection.label.length);


      rect(detection.x, detection.y, detection.width, detection.height);

      var offset = int(random(0, 21));


        console.log(mappedValues[detection.label])

      
      if (detection.label != lastDetected) {
        
        var url = 'https://api.spotify.com/v1/search?q=' + mappedValues[detection.label] + '&type=track&offset=' + offset + '&limit=20';
        console.log(url);
        getAPIData(accessToken, url, function(searchResults) {
          data = searchResults;
          select("#iframe-holder").html('<iframe src="https://open.spotify.com/embed/track/' + data.tracks.items[0].id + '" width="300" height="300" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>');
        });
        lastDetected = detection.label;

      }
    })
  }
}


// OAuth follows:
function getAPIData(accessToken, url, callback) {
  if (!accessToken) {
    throw "Can't do an API call without an access token!";
  }
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.setRequestHeader("Authorization", "Bearer " + accessToken);
  request.addEventListener("load", function() {
    callback(JSON.parse(this.responseText));
  });
  request.send();
}

// Access token is a temporary password we get, using our permanent password
function getAccessToken(callback) {
  var url = "https://accounts.spotify.com/api/token";
  // XMLHttpRequest is a way of doing a very customizable API call
  // You almost never need it
  var request = new XMLHttpRequest();
  request.open("POST", url, true);
  // The line below has our permanent password
  request.setRequestHeader("Authorization", "Basic OTQwZmI2NzAwN2I1NGM2OGI4NTdiNzg2YTg1YTc0YTA6MGFiYjA4NTI2Nzk2NDY2N2E2YmIwZDkyODY2Y2I4MTM=");


  request.setRequestHeader("content-type", "application/x-www-form-urlencoded");
  request.addEventListener("load", function() {
    callback(JSON.parse(this.responseText).access_token);
  });
  request.send("grant_type=client_credentials");
}
