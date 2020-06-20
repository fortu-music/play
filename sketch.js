var accessToken;
// var data;
// var genre;

let video;
let detector;
let detections;
let lastDetected = "";



function setup() {

  canvas = createCanvas(400, 300);
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
  console.log('model loaded')
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
        stroke(114, 189, 189);
      } else {
        stroke(253, 188, 74);
      }

      console.log(detection.label);
      rect(detection.x, detection.y, detection.width, detection.height);

      var offset = int(random(0, 21));


      if (detection.label != lastDetected) {

        if (detection.label == 'person') {
          var url = 'https://api.spotify.com/v1/search?q=name:human&type=track&offset=' + offset + '&limit=20';
          console.log(url);
          getAPIData(accessToken, url, function(searchResults) {
            data = searchResults;
            select("#iframe-holder").html('<iframe src="https://open.spotify.com/embed/track/' + data.tracks.items[0].id + '" width="300" height="300" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>');
          });
          lastDetected = detection.label;

        } else {

          var url = 'https://api.spotify.com/v1/search?q=name:' + detection.label + '&type=track&offset=' + offset + '&limit=20';
          getAPIData(accessToken, url, function(searchResults) {
            data = searchResults;
            select("#iframe-holder").html('<iframe src="https://open.spotify.com/embed/track/' + data.tracks.items[0].id + '" width="300" height="300" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>');
          });

          lastDetected = detection.label;
        }

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