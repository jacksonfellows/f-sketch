// SHAPES

function rect(x0, y0, x1, y1) {
	return intersection(right(x0), left(x1), upper(y0), lower(y1));
}

function circle(r, x0, y0) {
	return (x,y) => Math.sqrt((x0 - x)**2 + (y0 - y)**2) - r;
}

function roundedRect(x0, y0, x1, y1, r) {
	return union(
		rect(x0 + r, y0, x1 - r, y1),
		rect(x0, y0 + r, x1, y1 - r),
		circle(r, x0 + r, y0 + r),
		circle(r, x0 + r, y1 - r),
		circle(r, x1 - r, y0 + r),
		circle(r, x1 - r, y1 - r)
	);
}

function threePointCircle(x0, y0, x1, y1, x2, y2) {
	var A = x0*(y1 - y2) - y0*(x1 - x2) + x1*y2 - x2*y1;
	var B = (x0**2 + y0**2)*(y2 - y1) + (x1**2 + y1**2)*(y0 - y2) + (x2**2 + y2**2)*(y1 - y0);
	var C = (x0**2 + y0**2)*(x1 - x2) + (x1**2 + y1**2)*(x2 - x0) + (x2**2 + y2**2)*(x0 - x1);
	var D = (x0**2 + y0**2)*(x2*y1 - x1*y2) + (x1**2 + y1**2)*(x0*y2 - x2*y0) + (x2**2 + y2**2)*(x1*y0 - x0*y1);

	var centerX = -B/(2*A);
	var centerY = -C/(2*A);
	var r = Math.sqrt((B**2 + C**2 - 4*A*D)/(4*A**2));

	return circle(r, centerX, centerY);
}

function half(x0, y0, x1, y1, x2, y2) {
	var line;
	if (x0 == x1) {
		line = (x,y) => x - x0;
	} else {
		var m = (y1 - y0)/(x1 - x0);
		line = (x,y) => x*m + y0 - x0*m - y;
	}

	return line(x2,y2) < 0 ? line : inv(line);
}

function threePointSegment(x0, y0, x1, y1, x2, y2) {
	return intersection(threePointCircle(x0, y0, x1, y1, x2, y2), half(x0, y0, x2, y2, x1, y1));
}

function tri(x0, y0, x1, y1, x2, y2) {
	return intersection(
		half(x0, y0, x1, y1, x2, y2),
		half(x1, y1, x2, y2, x0, y0),
		half(x2, y2, x0, y0, x1, y1)
	);
}

function wedge(minTheta, maxTheta) {
	var w = 0.5*(maxTheta - minTheta);
	return rotate((x,y) => Math.abs(Math.atan2(y,x)) - w, minTheta + w);
}

function sector(r, minTheta, maxTheta) {
	return intersection(circle(r,0,0), wedge(minTheta, maxTheta));
}

function roundedSector(r, minTheta, maxTheta, m) {
	var dTheta = maxTheta - minTheta;
	var s1 = sector(r, -dTheta/2, dTheta/2);
	var s2 = sector(r, dTheta/2, 2*Math.PI - dTheta/2);
	var d = inv(circle(r,0,0));
	var cut = blend(s2,d,m);
	return rotate(difference(s1,cut), minTheta + dTheta/2);
}

function left(x0) {
	return (x,y) => x - x0;
}

function right(x0) {
	return (x,y) => x0 - x;
}

function lower(y0) {
	return (x,y) => y - y0;
}

function upper(y0) {
	return (x,y) => y0 - y;
}

// SET OPERATIONS

function binUnion(a,b) {
	return (x,y) => Math.min(a(x,y), b(x,y));
}

function union(...args) {
	return args.reduce(binUnion);
}

function binIntersection(a,b) {
	return (x,y) => Math.max(a(x,y), b(x,y));
}

function intersection(...args) {
	return args.reduce(binIntersection);
}

function inv(shape) {
	return (x,y) => -shape(x,y);
}

function difference(a,...rest) {
	return intersection(a, inv(union(...rest)));
}

// GEOMETRIC TRANSFORMS

function translate(shape, dx, dy) {
	return (x,y) => shape(x - dx, y - dy);
}

function rotate(shape, theta) {
	return (x,y) => shape(x*Math.cos(-theta) - y*Math.sin(-theta), x*Math.sin(-theta) + y*Math.cos(-theta));
}

function scale(shape, sx, sy) {
	return (x, y) => shape(x/sx, y/sy);
}

function mirrorX(shape){
	return scale(shape, 1, -1);
}

function mirrorY(shape) {
	return scale(shape, -1, 1);
}

function shearY(shape, m) {
	return (x, y) => shape(x, y-m*x)
}

function shearX(shape, m) {
	return (x, y) => shape(x-m*y, y)
}

// OTHER

function blend(a, b, m) {
	return (x,y) => -Math.log(Math.exp(-1/m * a(x,y)) + Math.exp(-1/m * b(x,y))) * m;
}

function offset(shape, o) {
	return (x,y) => shape(x,y) - o; 
}

// UTILITIES

function degToRad(deg) {
	return deg * Math.PI/180;
}

function radToDeg(rad){
	return rad * 180/Math.PI;
}

function range(min, max, step=1) {
	var l = [];
	for (var i = min; i < max; i += step) {
		l.push(i);
	}
	return l;
}