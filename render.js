var DEFAULT_CONFIG = {
	// general:
	scaleX: 100,
	scaleY: 100,
	// marching squares:
	gridDx: 5,
	gridDy: 5
};
var CONFIG = Object.assign({}, DEFAULT_CONFIG); // shallow copy

var shapesToRender = []

function render(shape) {
	shapesToRender.push(shape);
}

function doRender() {
	CONFIG = Object.assign({}, DEFAULT_CONFIG); // shallow copy

	shapesToRender = [];
	eval(model.value);

	resizeCanvas();
	// drawMarchingSquares(union(...shapesToRender));
	shapesToRender.forEach(drawMarchingSquares);
}

function resizeCanvas() {
	var parent = canvas.parentNode;
	var styles = getComputedStyle(parent);
	var w = parseInt(styles.getPropertyValue("width"), 10);
	var h = parseInt(styles.getPropertyValue("height"), 10);
	canvas.width = w;
	canvas.height = h;
}

window.addEventListener('resize', doRender, false);

function setup() {
	canvas = document.getElementById('c');
	ctx = canvas.getContext('2d');


	model = document.getElementById('model');
	rendering = document.getElementById('rendering');

	model.oninput = doRender;
	doRender();
}

window.onload = setup;

var toWorldX = x => (x - 0.5*canvas.width) / CONFIG.scaleX;
var toWorldY = y => (0.5*canvas.height - y) / CONFIG.scaleY;

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

function drawGradient(shape, scale, base) {
	// TODO: bad bad bad bad
	var imageData = ctx.createImageData(canvas.width, canvas.height);
	var minV = Number.POSITIVE_INFINITY;
	var maxV = Number.NEGATIVE_INFINITY;
	for (var x = 0; x < canvas.width; ++x) {
		for (var y = 0; y < canvas.height; ++y) {
			var v = shape(toWorldX(x),toWorldY(y));
			if (v < minV) {
				minV = v;
			}
			if (v > maxV) {
				maxV = v;
			}
		}
	}
	for (var x = 0; x < canvas.width; ++x) {
		for (var y = 0; y < canvas.height; ++y) {
			var v = shape(toWorldX(x),toWorldY(y));
			if (scale === 'log') {
				var c = 255 * Math.log(v - minV + 1)/Math.log(maxV - minV + 1);
			} else {
				var c = 255 * (v - minV)/(maxV - minV);
			}
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

	var cornersWidth = Math.floor(canvas.width / CONFIG.gridDx) + 1;
	var cornersHeight = Math.floor(canvas.height / CONFIG.gridDy) + 1;
	var row = new Float64Array(cornersWidth);
	var lastRow, lastVal;
	for (var j = 0; j < cornersHeight; ++j) {
		for (var i = 0; i < cornersWidth; ++i) {
			var x = i * CONFIG.gridDx;
			var y = j * CONFIG.gridDy;
			var val = shape(toWorldX(x), toWorldY(y));

			// ctx.beginPath();
			// ctx.arc(i * CONFIG.gridDx, j * CONFIG.gridDy, 1, 2 * Math.PI, false);
			// ctx.fillStyle = val < 0 ? 'red' : 'black';
			// ctx.fill();

			if (i > 0 && j > 0) {
				var cellI = ((lastRow[i-1] < 0) << 3) | ((lastRow[i] < 0) << 2) | ((val < 0) << 1) | (lastVal < 0);
				var edge = edges[cellI];
				if (edge) {
					ctx.beginPath();
					ctx.moveTo(CONFIG.gridDx * (i + getDx(edge[0], lastVal, val, lastRow[i], lastRow[i-1])), CONFIG.gridDy * (j + getDy(edge[0], lastVal, val, lastRow[i], lastRow[i-1])));
					ctx.lineTo(CONFIG.gridDx * (i + getDx(edge[1], lastVal, val, lastRow[i], lastRow[i-1])), CONFIG.gridDy * (j + getDy(edge[1], lastVal, val, lastRow[i], lastRow[i-1])));
					ctx.stroke();
				}
			}

			lastVal = val;
			row[i] = val;
		}
		lastRow = new Float64Array(row);
	}
}
