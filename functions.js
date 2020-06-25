function circle(r, x0, y0) {
    return (x,y) => (x0 - x)**2 + (y0 - y)**2 - r**2;
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

function difference(a,...rest) {
    return intersection(a, inv(union(...rest)));
}

function translate(shape, dx, dy) {
    return (x,y) => shape(x - dx, y - dy);
}

function rotate(shape, theta) {
    return (x,y) => shape(x*Math.cos(theta) - y*Math.sin(theta), x*Math.sin(theta) + y*Math.cos(theta));
}

function inv(shape) {
    return (x,y) => -shape(x,y);
}

function rect(x0, y0, x1, y1) {
    return intersection(right(x0), left(x1), upper(y0), lower(y1));
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

function scale(shape, sx, sy) {
    return (x, y) => shape(x/sx, y/sy);
}

function mirrorX(shape){
    return scale(shape, 1, -1);
}

function mirrorY(shape) {
    return scale(shape, -1, 1);
}

function blend(a, b, m) {
    return (x,y) => -Math.log(Math.exp(-1/m * a(x,y)) + Math.exp(-1/m * b(x,y))) * m;
}
