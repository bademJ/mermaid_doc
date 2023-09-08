import intersectRect from './intersect/intersect-rect.js';
import { log } from '../logger.js';
import createLabel from './createLabel.js';
import { createText } from '../rendering-util/createText.js';
import { select } from 'd3';
import { getConfig } from '../config.js';
import { evaluate } from '../diagrams/common/common.js';
import {subPoolPar} from "../diagrams/flowchart/flowDb.js";
import {poolHeightCosumer, lineHeightPos, nodeElems} from "../dagre-wrapper/nodes.js"
import {labelWidthController} from "./index.js";


const rect = (parent, node) => {
  // log.warn('Creating subgraph rect for ', node.id, JSON.parse(JSON.stringify(node)), "par pool height", JSON.stringify(poolHeightCosumer[subPoolPar[node.id]]), "parent", parent);

  // log.warn('Creating subgraph rect for ', node.id, JSON.parse(JSON.stringify(node)), "par pool height", JSON.stringify(poolHeightCosumer[subPoolPar[node.id]]), "parent", parent);
  // Add outer g element
  const shapeSvg = parent
    .insert('g')
    .attr('class', 'cluster' + (node.class ? ' ' + node.class : ''))
    .attr('id', node.id);

  // add the rect
  const rect = shapeSvg.insert('rect', ':first-child');

  const useHtmlLabels = evaluate(getConfig().flowchart.htmlLabels);
  log.warn("text siiiiz", node.id, node.width)
  // Create the label and insert it after the rect
  const innerRect = shapeSvg.append('rect');
  const label = shapeSvg.insert('g').attr('class', 'cluster-label');

  let st = 'fill: #ACFFAB;'
  if (node.type == 'pool') {
    st = 'fill: #90ae90;'
  }

  let gap = 7

  const text =
    node.labelType === 'markdown'
      ? createText(label, node.labelText, { style: node.labelStyle, useHtmlLabels })
      : label.node().appendChild(createLabel(node.labelText, node.labelStyle, undefined, true));

  // Get the size of the label
  let bbox = text.getBBox();

  if (evaluate(getConfig().flowchart.htmlLabels)) {
    const div = text.children[0];
    const dv = select(text);
    bbox = div.getBoundingClientRect();
    dv.attr('width', bbox.width);
    dv.attr('height', bbox.height);
  }
  log.warn("mimimi translate nodewewe22", node.id, bbox)

  const padding = 0 * node.padding;
  const halfPadding = padding / 2;
  if (node.type == 'subpool') {
    node.width = 2000
  }
  // node.width = 1200
  const width = node.width <= bbox.width + padding ? bbox.width + padding : node.width;
  if (node.width <= bbox.width + padding) {
    node.diff = (bbox.width - node.width) / 2 - node.padding / 2;
  } else {
    node.diff = -node.padding / 2;
  }

  log.trace('Data ', node, JSON.stringify(node));
  log.warn('Data inja inja unkja na', node, node.x, node.y, "?", width, "<>", bbox);
  var y = node.y - node.height / 2 - halfPadding
  // center the rect around its coordinate
  //mode 2
  // y = 0

  let innerPadding = 15
  // if (node.type == 'pool') {
  //   innerPadding /= 2
  // }
  let innerHalfPadding = innerPadding / 2

  rect
    .attr('class', 'outer')
    .attr('x', innerHalfPadding)
    .attr('y', y)
    .attr('style', node.style)
    .attr('width', width)
    .attr('height', node.height + padding);
  // Center the label
  label.attr(
    'transform',
    'translate(' +
    // (node.x - bbox.width / 2) +
    -bbox.width + padding +
    ', ' +
    node.y +
    // (node.y -
    //   node.height / 2 -
    //   node.padding / 3 +
    //   (evaluate(getConfig().flowchart.htmlLabels) ? 5 : 3)) +
    ')'
  );
  // node.x = bbox.width/2
  innerRect
    .attr('class', 'inner')
    .attr('x', -bbox.width - innerHalfPadding)
    .attr('y', y)
    .attr('style', st)
    .attr('width', bbox.width + innerPadding)
    .attr('height', node.height + padding);


  // rect
  //   .attr('style', node.style)
  //   .attr('rx', node.rx)
  //   .attr('ry', node.ry)
  //   // .attr('x', node.x - width / 2)
  //   .attr('x', 9 * gap)
  //   .attr('y', y)
  //   .attr('width', width)
  //   .attr('height', node.height);

  log.warn(" KKNNASDASD23 ", node.height, node)
  // if (useHtmlLabels) {
  //   log.warn("injaeen aslamn", node)
  //   label.attr(
  //     'transform',
  //     // This puts the labal on top of the box instead of inside it
  //     // 'translate(' + (node.x - bbox.width / 2) + ', ' + (node.y - node.height / 2) + ')'
  //     //left outside
  //     'translate(' + (bbox.width / 2) + ', ' + (node.y) + ')'
  // );
  // } else {
  //   label.attr(
  //     'transform',
  //     // This puts the labal on top of the box instead of inside it
  //     'translate(' + node.x + ', ' + (node.y - node.height / 2) + ')'
  //   );
  // }
  // Center the label
  node.labelWidth = bbox.width
  labelWidthController[node.id] = bbox.width + innerPadding
  const rectBox = rect.node().getBBox();
  node.width = rectBox.width;
  node.height = rectBox.height;

  log.warn(" KKNNASDASD ", node.height, node)

  node.intersect = function (point) {
    return intersectRect(node, point);
  };
  return shapeSvg;
};

/**
 * Non visible cluster where the note is group with its
 *
 * @param {any} parent
 * @param {any} node
 * @returns {any} ShapeSvg
 */
const noteGroup = (parent, node) => {
  // Add outer g element
  const shapeSvg = parent.insert('g').attr('class', 'note-cluster').attr('id', node.id);

  // add the rect
  const rect = shapeSvg.insert('rect', ':first-child');

  const padding = 0 * node.padding;
  const halfPadding = padding / 2;

  // center the rect around its coordinate
  rect
    .attr('rx', node.rx)
    .attr('ry', node.ry)
    .attr('x', node.x - node.width / 2 - halfPadding)
    .attr('y', node.y - node.height / 2 - halfPadding)
    .attr('width', node.width + padding)
    .attr('height', node.height + padding)
    .attr('fill', 'none');

  const rectBox = rect.node().getBBox();
  node.width = rectBox.width;
  node.height = rectBox.height;

  node.intersect = function (point) {
    return intersectRect(node, point);
  };

  return shapeSvg;
};
const roundedWithTitle = (parent, node) => {
  // Add outer g element
  const shapeSvg = parent.insert('g').attr('class', node.classes).attr('id', node.id);

  // add the rect
  const rect = shapeSvg.insert('rect', ':first-child');

  // Create the label and insert it after the rect
  const label = shapeSvg.insert('g').attr('class', 'cluster-label');
  const innerRect = shapeSvg.append('rect');

  const text = label
    .node()
    .appendChild(createLabel(node.labelText, node.labelStyle, undefined, true));

  // Get the size of the label
  let bbox = text.getBBox();
  if (evaluate(getConfig().flowchart.htmlLabels)) {
    const div = text.children[0];
    const dv = select(text);
    bbox = div.getBoundingClientRect();
    dv.attr('width', bbox.width);
    dv.attr('height', bbox.height);
  }
  bbox = text.getBBox();
  const padding = 0 * node.padding;
  const halfPadding = padding / 2;

  const width = node.width <= bbox.width + node.padding ? bbox.width + node.padding : node.width;
  if (node.width <= bbox.width + node.padding) {
    node.diff = (bbox.width + node.padding * 0 - node.width) / 2;
  } else {
    node.diff = -node.padding / 2;
  }

  // center the rect around its coordinate
  rect
    .attr('class', 'outer')
    .attr('x', node.x - width / 2 - halfPadding)
    .attr('y', node.y - node.height / 2 - halfPadding)
    .attr('width', width + padding)
    .attr('height', node.height + padding);
  innerRect
    .attr('class', 'inner')
    .attr('x', node.x - width / 2 - halfPadding)
    .attr('y', node.y - node.height / 2 - halfPadding + bbox.height - 1)
    .attr('width', width + padding)
    .attr('height', node.height + padding - bbox.height - 3);

  // Center the label
  label.attr(
    'transform',
    'translate(' +
      (node.x - bbox.width / 2) +
      ', ' +
      (node.y -
        node.height / 2 -
        node.padding / 3 +
        (evaluate(getConfig().flowchart.htmlLabels) ? 5 : 3)) +
      ')'
  );

  const rectBox = rect.node().getBBox();
  node.height = rectBox.height;

  node.intersect = function (point) {
    return intersectRect(node, point);
  };

  return shapeSvg;
};

const divider = (parent, node) => {
  // Add outer g element
  const shapeSvg = parent.insert('g').attr('class', node.classes).attr('id', node.id);

  // add the rect
  const rect = shapeSvg.insert('rect', ':first-child');

  const padding = 0 * node.padding;
  const halfPadding = padding / 2;

  // center the rect around its coordinate
  rect
    .attr('class', 'divider')
    .attr('x', node.x - node.width / 2 - halfPadding)
    .attr('y', node.y - node.height / 2)
    .attr('width', node.width + padding)
    .attr('height', node.height + padding);

  const rectBox = rect.node().getBBox();
  node.width = rectBox.width;
  node.height = rectBox.height;
  node.diff = -node.padding / 2;
  node.intersect = function (point) {
    return intersectRect(node, point);
  };

  return shapeSvg;
};

const shapes = { rect, roundedWithTitle, noteGroup, divider };

let clusterElems = {};

export const insertCluster = (elem, node) => {
  log.trace('Inserting cluster');
  log.warn("insert clustereeee", node, elem)
  const shape = node.shape || 'rect';
  if(!clusterElems[node.id]) {
    clusterElems[node.id] = shapes[shape](elem, node);
  }
};
export const getClusterTitleWidth = (elem, node) => {
  const label = createLabel(node.labelText, node.labelStyle, undefined, true);
  elem.node().appendChild(label);
  const width = label.getBBox().width;
  elem.node().removeChild(label);
  return width;
};

export const clear = () => {
  clusterElems = {};
};

export const positionCluster = (node) => {
  // log.warn('Position cluster (' + node.id + ', ' + node.x + ', ' + node.y + ')');
  const el = clusterElems[node.id];
  const nodeEl = nodeElems[node.id];
  log.warn("node Clusterdasdasd", nodeEl)
  var y = 0;

  if (!poolHeightCosumer[subPoolPar[node.id]]) {
    poolHeightCosumer[subPoolPar[node.id]] = 0
  }
  y = poolHeightCosumer[subPoolPar[node.id]];
  lineHeightPos[node.id] = y
  poolHeightCosumer[subPoolPar[node.id]] += node.height
  el.attr('transform', 'translate(' + 0 + ', ' + y + ')');
};
