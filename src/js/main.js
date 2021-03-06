var jsQR = require('./jsQR.js')
var video = document.createElement('video');
var canvasElement = document.getElementById('canvas');
var canvas = canvasElement.getContext('2d');
var loadingMessage = document.getElementById('loadingMessage');
var outputContainer = document.getElementById('output');
var outputMessage = document.getElementById('outputMessage');
var outputData = document.getElementById('outputData');
var linkApp = document.getElementById('link-app');
var linkWeb = document.getElementById('link-web');
var startCamera = document.getElementById('start');
var playing = false;

function getDomain(url) {
    url = url.replace(/(https?:\/\/)?(www.)?/i, '');
    url = url.split('.');
    url = url.slice(url.length - 2).join('.');
    if (url.indexOf('/') !== -1) {
        return url.split('/')[0];
    }
    return url;
}

function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
}

// Use facingMode: environment to attemt to get the front camera on phones
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (stream) {
    video.srcObject = stream;
    video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
});

function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        playing = true;
        startCamera.style.display = 'none';
        loadingMessage.hidden = true;
        canvasElement.hidden = false;
        outputContainer.hidden = false;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
        });
        if (code) {
            drawLine(code.location.topLeftCorner, code.location.topRightCorner, '#FF3B58');
            drawLine(code.location.topRightCorner, code.location.bottomRightCorner, '#FF3B58');
            drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF3B58');
            drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF3B58');
            outputMessage.hidden = true;
            outputData.parentElement.hidden = false;
            outputData.innerText = code.data;
            linkWeb.href = code.data
            if (getDomain(code.data) == 'decouverto.fr') {
                var reg = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
                var pathname = reg.exec(code.data)[1];  
                linkApp.href = 'decouverto://decouverto' + pathname;
                linkApp.style.display = 'inline-block';
            } else {
                linkApp.style.display = 'none';
            }
        }
    } else {
        playing = false;
        startCamera.style.display = 'inline-block';
        loadingMessage.innerText = '⌛ Chargement de la vidéo...'
    }
    requestAnimationFrame(tick);
}

startCamera.onclick = function () {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (stream) {
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
    });
}