import {log} from "../../logger.js";

/**
 * @param node
 * @param bboxWidth
 * @param bboxHeight
 * @param gap
 * @param point
 */
const intersectCustomRect = (node, bboxWidth, bboxHeight, gap, point) => {
  var x = node.x;
  var y = node.y;

  var padFromRL = (bboxWidth / 2);

  // Rectangle intersection algorithm from:
  // https://math.stackexchange.com/questions/108113/find-edge-between-two-boxes
  var dx = point.x - x;
  var dy = point.y - y;
  var w = node.shapeWidth / 2;
  var h = node.height / 2;

  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      // up
      h = -h + bboxHeight;
    } else {
      // down
      h = h + bboxHeight;
    }
    sx = dy === 0 ? 0 : (h * dx) / dy;
    sy = h;
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      // left
      w = -w + bboxWidth;
    } else {
      // right
      w = w + padFromRL;
    }
    sx = w;
    sy = dx === 0 ? 0 : (w * dy) / dx;
  }

  return { x: x + sx, y: y + sy };
};

export default intersectCustomRect;
