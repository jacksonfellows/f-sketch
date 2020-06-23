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

function union(a,b) {
    return (x,y) => Math.min(a(x,y), b(x,y));
}

function intersection(a,b) {
    return (x,y) => Math.max(a(x,y), b(x,y));
}

function difference(a,b) {
    return intersection(a, inv(b));
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

function rectangle(xMin, yMin, xMax, yMax) {
    return intersection(right(xMin), intersection(left(xMax), intersection(upper(yMin), lower(yMax))));
}
