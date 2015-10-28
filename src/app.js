var Simplex = require('simplex-noise');
var getUserMedia = require('getusermedia');

var h = window.innerHeight;
var w = window.innerWidth;
var resolution = 128;
var verticalLines = 64;
var startX = w * 0.2;
var endX = w * 0.8;
var startY = h * 0.2;
var endY = h * 0.8;
var stepT = Math.PI / resolution * 2;

var stepX = (endX - startX)/resolution;
var stepY = (endY - startY)/verticalLines;

var linecolor = "rgb(200, 200, 200)";
var fillColor = "#000"

var noise = new Simplex();

var canvas = document.getElementById('canvas')
canvas.height = h;
canvas.width = w;
var ctx = canvas.getContext('2d');
var vid = document.createElement('video');
vid.setAttribute('autoplay', true);
var vidCan = document.createElement('canvas');
vidCan.width = resolution;
vidCan.height = verticalLines;
var vidCtx = vidCan.getContext('2d');
var vidImg;

var size = resolution * verticalLines;
var data = new Float32Array( size );

for (var i = 0; i < size; i++) {
  data[i] = 0;
}


function handleCameraFrame() {
  vidCtx.drawImage(vid, 0, 0, resolution, verticalLines);
  vidImg = vidCtx.getImageData(0, 0, resolution, verticalLines );

  var pix = vidImg.data;
  var j = 0, all;
  for (var i = 0, l = pix.length; i < l; i += (4)) {
    var all = pix[i] + pix[i+1] + pix[i+2];
    data[j++] = all/30;
  }
}




function drawFill(points) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = fillColor;
  var p = points[0];
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]+100);
  for (var i = 0, l = points.length; i < l; i++) {
    p = points[i];
    ctx.lineTo(p[0], p[1]);
  }
  ctx.lineTo(p[0], p[1]+100)
  ctx.closePath();
  ctx.fill();

}

function drawLine(points) {
  var p = points[0];
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  for (var i = 1, l = points.length; i < l; i++) {
    p = points[i];
    ctx.lineTo(p[0], p[1]);
  }

  ctx.strokeStyle = linecolor;
  ctx.stroke();
}

var time = 0;

function drawScanLine(number) {
  var currentY = startY + (number * stepY);
  var currentX = startX;
  var points = [];
  var spike;
  var mult = 0;
  var t = 0;
  var yState = currentY;
  var yIndex = number * resolution;

  for (i = 0; i < resolution; i++) {
    currentX += stepX;
    yState = currentY + (stepY * 0.1 * data[yIndex + i])
    points.push([currentX, yState])
  }

  //while (currentX < endX) {
  // t += stepT;
  //  mult = Math.sin(t) ;
  //  currentX += stepX;
  //  spike = Math.sin(t/2) * noise.noise2D(currentX+time, currentY+time) * 50;
  //  yState -= mult;
  //  points.push([currentX, yState-Math.abs(spike)]);
  //}

  drawFill(points);
  drawLine(points);
  //ctx.putImageData(vidImg, 0, 0)
}

function drawImage() {
  time += 0.01;
  ctx.clearRect(0, 0, w, h);
  handleCameraFrame();
  for (var i = 0; i < verticalLines; i++) {
    drawScanLine(i);
  }
  requestAnimationFrame(drawImage);
}

getUserMedia({video: true, audio: false}, function(err, stream) {
  vid.src = window.URL.createObjectURL(stream);
})



drawImage();
