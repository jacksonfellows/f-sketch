var canvas, ctx;

// TODO: have an actual default system
var defaultGridDx = 10;
var defaultGridDy = 10;

var gridDx = defaultGridDx;
var gridDy = defaultGridDy;

var defaultMinX = -10;
var defaultMinY = -10;
var defaultMaxX = +10;
var defaultMaxY = +10;

var minX = defaultMinX;
var minY = defaultMinY;
var maxX = defaultMaxX;
var maxY = defaultMaxY;

var shapesToRender = []

function render(shape) {
    shapesToRender.push(shape);
}

function doRender() {
    drawMarchingSquares(shapesToRender.reduce(union));
}

function setup() {
    canvas = document.getElementById('c');
    ctx = canvas.getContext('2d');

    model = document.getElementById('model');
    model.oninput = function () {
        gridDx = defaultGridDx;
        gridDy = defaultGridDy;
        minX = defaultMinX;
        minY = defaultMinY;
        maxX = defaultMaxX;
        maxY = defaultMaxY;

        shapesToRender = []
        eval(model.value);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        doRender();
    };
}

var toWorldX = x => (x / canvas.width) * (maxX - minX) + minX;
var toWorldY = y => (1 - (y / canvas.height)) * (maxY - minY) + minY;

function drawBitmap(shape) {
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    for (var x = 0; x < canvas.width; ++x) {
        for (var y = 0; y < canvas.height; ++y) {
            var c = shape(toWorldX(x),toWorldY(y)) < 0 ? 0 : 255;
            var red = y * (canvas.width * 4) + x * 4;
            imageData.data[red]   = c;
            imageData.data[red+1] = c;
            imageData.data[red+2] = c;
            imageData.data[red+3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

var N = 0;
var E = 1;
var S = 2;
var W = 3;

var edges = [
    null,
    [W,S],
    [S,E],
    [W,E],
    [N,E],
    null, // saddle
    [N,S],
    [W,N],
    [W,N],
    [N,S],
    null, // saddle
    [N,E],
    [W,E],
    [S,E],
    [W,S],
    null
];

function lerp(x0, y0, x1, y1, x) {
    return y0 + (x - x0) * ((y1 - y0) / (x1 - x0));
}

function getDx(side, sw, se, ne, nw) {
    switch (side) {
    case N:
        return lerp(nw, -1, ne, 0, 0);
    case E:
        return 0;
    case S:
        return lerp(sw, -1, se, 0, 0);
    case W:
        return -1;
    }
}

function getDy(side, sw, se, ne, nw) {
    switch (side) {
    case N:
        return -1;
    case E:
        return lerp(ne, -1, se, 0, 0);
    case S:
        return 0;
    case W:
        return lerp(nw, -1, sw, 0, 0);
    }
}

function drawMarchingSquares(shape) {
    ctx.strokeStyle = 'red';

    var cornersWidth = Math.floor(canvas.width / gridDx) + 1;
    var cornersHeight = Math.floor(canvas.height / gridDy) + 1;
    var row = new Float64Array(cornersWidth);
    var lastRow, lastVal;
    for (var j = 0; j < cornersHeight; ++j) {
        for (var i = 0; i < cornersWidth; ++i) {
            var x = i * gridDx;
            var y = j * gridDy;
            var val = shape(toWorldX(x), toWorldY(y));

            // ctx.beginPath();
            // ctx.arc(i * gridDx, j * gridDy, 1, 2 * Math.PI, false);
            // ctx.fillStyle = val < 0 ? 'red' : 'black';
            // ctx.fill();

            if (i > 0 && j > 0) {
                var cellI = ((lastRow[i-1] < 0) << 3) | ((lastRow[i] < 0) << 2) | ((val < 0) << 1) | (lastVal < 0);
                var edge = edges[cellI];
                if (edge) {
                    ctx.beginPath();
                    ctx.moveTo(gridDx * (i + getDx(edge[0], lastVal, val, lastRow[i], lastRow[i-1])), gridDy * (j + getDy(edge[0], lastVal, val, lastRow[i], lastRow[i-1])));
                    ctx.lineTo(gridDx * (i + getDx(edge[1], lastVal, val, lastRow[i], lastRow[i-1])), gridDy * (j + getDy(edge[1], lastVal, val, lastRow[i], lastRow[i-1])));
                    ctx.stroke();
                }
            }

            lastVal = val;
            row[i] = val;
        }
        lastRow = new Float64Array(row);
    }
}
