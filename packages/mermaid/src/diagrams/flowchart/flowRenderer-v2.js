import * as graphlib from 'dagre-d3-es/src/graphlib/index.js';
import * as graphlibJson from 'dagre-d3-es/src/graphlib/json.js';
import { select, curveLinear, selectAll } from 'd3';

import flowDb from './flowDb.js';
import { getConfig } from '../../config.js';
import utils from '../../utils.js';

import { render } from '../../dagre-wrapper/index.js';
import { addHtmlLabel } from 'dagre-d3-es/src/dagre-js/label/add-html-label.js';
import { log } from '../../logger.js';
import common, { evaluate } from '../common/common.js';
import { interpolateToCurve, getStylesFromArray } from '../../utils.js';
import { setupGraphViewbox } from '../../setupGraphViewbox.js';

const conf = {};
export const setConf = function (cnf) {
  const keys = Object.keys(cnf);
  for (const key of keys) {
    conf[key] = cnf[key];
  }
};

/**
 * Function that adds the vertices found during parsing to the graph to be rendered.
 *
 * @param vert Object containing the vertices.
 * @param g The graph that is to be drawn.
 * @param svgId
 * @param root
 * @param doc
 * @param diagObj
 */
export const addVertices = function (vert, g, svgId, root, doc, diagObj) {
  const svg = root.select(`[id="${svgId}"]`);
  const keys = Object.keys(vert);

  // Iterate through each item in the vertex object (containing all the vertices found) in the graph definition
  keys.forEach(function (id) {
    const vertex = vert[id];

    /**
     * Variable for storing the classes for the vertex
     *
     * @type {string}
     */
    let classStr = 'default';
    if (vertex.classes.length > 0) {
      classStr = vertex.classes.join(' ');
    }
    classStr = classStr + ' flowchart-label';
    const styles = getStylesFromArray(vertex.styles);

    // Use vertex id as text in the box if no text is provided by the graph definition
    let vertexText = vertex.text !== undefined ? vertex.text : vertex.id;

    // We create a SVG label, either by delegating to addHtmlLabel or manually
    let vertexNode;
    log.info('vertex', vertex, vertex.labelType);
    // if (vertex.labelType === 'markdown') {
    //   log.info('vertex', vertex, vertex.labelType);
    // } else {
    //   if (evaluate(getConfig().flowchart.htmlLabels)) {
    //     // TODO: addHtmlLabel accepts a labelStyle. Do we possibly have that?
    //     const node = {
    //       label: vertexText.replace(
    //         /fa[blrs]?:fa-[\w-]+/g,
    //         (s) => `<i class='${s.replace(':', ' ')}'></i>`
    //       ),
    //     };
    //     vertexNode = addHtmlLabel(svg, node).node();
    //     vertexNode.parentNode.removeChild(vertexNode);
    //   } else {
    //     const svgLabel = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
    //     svgLabel.setAttribute('style', styles.labelStyle.replace('color:', 'fill:'));
    //
    //     const rows = vertexText.split(common.lineBreakRegex);
    //
    //     for (const row of rows) {
    //       const tspan = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    //       tspan.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
    //       tspan.setAttribute('dy', '1em');
    //       tspan.setAttribute('x', '1');
    //       tspan.textContent = row;
    //       svgLabel.appendChild(tspan);
    //     }
    //     vertexNode = svgLabel;
    //   }
    // }

    let radious = 0;
    let taskType = undefined
    let _shape = '';
    // Set the shape based parameters
    log.warn('setNodeee', {
      labelStyle: styles.labelStyle,
      labelType: vertex.labelType,
      shape: vertex.type,
      labelText: vertexText,
      rx: radious,
      ry: radious,
      class: classStr,
      style: styles.style,
      id: vertex.id,
      domId: diagObj.db.lookUpDomId(vertex.id),
      width: vertex.type === 'group' ? 500 : undefined,
      type: vertex.type,
      dir: vertex.dir,
      props: vertex.props,
      padding: getConfig().flowchart.padding,
    });
    switch (vertex.type) {
      case 'round':
        radious = 5;
        _shape = 'person';
        break;
      case 'square':
        _shape = 'rect';
        break;
      case 'diamond':
        _shape = 'rect';
        break;
      case 'x_diamond':
        radious = 5;
        _shape = 'task';
        taskType = 'manual'
        break;
      case 'personTask':
        radious = 5;
        _shape = 'task';
        taskType = 'user'
        break;
      case 'bussiness_task':
        radious = 5;
        _shape = 'task';
        taskType = 'business-rule'
        break;
      case 'manual_task':
        radious = 5;
        _shape = 'task';
        taskType = 'manual'
        break;
      case 'script_task':
        radious = 5;
        _shape = 'task';
        taskType = 'script'
        break;
      case 'send_task':
        radious = 5;
        _shape = 'task';
        taskType = 'send'
        break;
      case 'service_task':
        radious = 5;
        _shape = 'task';
        taskType = 'service'
        break;
      case 'receive_task':
        radious = 5;
        _shape = 'task';
        taskType = 'receive'
        break;
      case 'user_task':
        radious = 5;
        _shape = 'task';
        taskType = 'user'
        break;

      case 'sende':
        radious = 5;
        _shape = 'task';
        taskType = 'sub-process-marker'
        break;
      case 'hexagon':
        _shape = 'hexagon';
        break;
      case 'odd':
        _shape = 'rect_left_inv_arrow';
        break;
      case 'lean_right':
        _shape = 'lean_right';
        break;
      case 'lean_left':
        _shape = 'lean_left';
        break;
      case 'trapezoid':
        _shape = 'trapezoid';
        break;
      case 'inv_trapezoid':
        _shape = 'inv_trapezoid';
        break;
      case 'odd_right':
        _shape = 'rect_left_inv_arrow';
        break;
      case 'circle':
        _shape = 'circle';
        break;
      case 'ellipse':
        _shape = 'ellipse';
        break;
      case 'stadium':
        _shape = 'stadium';
        break;
      case 'subroutine':
        _shape = 'subroutine';
        break;
      case 'cylinder':
        _shape = 'cylinder';
        break;
      case 'group':
        _shape = 'rect';
        break;
      case 'end_event_compensation':
        _shape = 'extraShape'
        taskType = 'end-event-compensation'
        break;
      case 'end_event_compen':
        _shape = 'extraShape'
        taskType = 'end-event-compen'
        break;
      case 'end_event_cancel':
        _shape = 'extraShape'
        taskType = 'end-event-cancel'
        break;
      case 'lane_divide_three':
        _shape = 'extraShape'
        taskType = 'lane-divide-three'
        break;
      case 'intermediate_event_catch_parallel_multiple':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-parallel-multiple'
        break;
      case 'service':
        _shape = 'extraShape'
        taskType = 'service'
        break;
      case 'end_event_signal':
        _shape = 'extraShape'
        taskType = 'end-event-signal'
        break;
      case 'sequential_mi_marker':
        _shape = 'extraShape'
        taskType = 'sequential-mi-marker'
        break;
      case 'intermediate_event_throw_escalation':
        _shape = 'extraShape'
        taskType = 'intermediate-event-throw-escalation'
        break;
      case 'receive':
        _shape = 'extraShape'
        taskType = 'receive'
        break;
      case 'intermediate_event_catch_signal':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-signal'
        break;
      case 'compensation_marker':
        _shape = 'extraShape'
        taskType = 'compensation-marker'
        break;
      case 'start_event_parallel_multiple':
        _shape = 'extraShape'
        taskType = 'start-event-parallel-multiple'
        break;
      case 'intermediate_event_catch_multiple':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-multiple'
        break;
      case 'end_event_escalation':
        _shape = 'extraShape'
        taskType = 'end-event-escalation'
        break;
      case 'trash':
        _shape = 'extraShape'
        taskType = 'trash'
        break;
      case 'start_event_non_interrupting_parallel_multiple':
        _shape = 'extraShape'
        taskType = 'start-event-non-interrupting-parallel-multiple'
        break;
      case 'data_object':
        _shape = 'extraShape'
        taskType = 'data-object'
        break;
      case 'end_event_error':
        _shape = 'extraShape'
        taskType = 'end-event-error'
        break;
      case 'gateway_complex':
        _shape = 'extraShape'
        taskType = 'gateway-complex'
        break;
      case 'intermediate_event_catch_error':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-error'
        break;
      case 'start_event_non_interrupting_escalation':
        _shape = 'extraShape'
        taskType = 'start-event-non-interrupting-escalation'
        break;
      case 'intermediate_event_throw_link':
        _shape = 'extraShape'
        taskType = 'intermediate-event-throw-link'
        break;
      case 'gateway_xor':
        _shape = 'extraShape'
        taskType = 'gateway-xor'
        break;
      case 'lane_insert_below':
        _shape = 'extraShape'
        taskType = 'lane-insert-below'
        break;
      case 'gateway_eventbased':
        _shape = 'extraShape'
        taskType = 'gateway-eventbased'
        break;
      case 'intermediate_event_catch_non_interrupting_escalation':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-non-interrupting-escalation'
        break;
      case 'send':
        _shape = 'extraShape'
        taskType = 'send'
        break;
      case 'gateway_none':
        _shape = 'extraShape'
        taskType = 'gateway-none'
        break;
      case 'gateway_parallel':
        _shape = 'extraShape'
        taskType = 'gateway-parallel'
        break;
      case 'intermediate_event_catch_message':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-message'
        break;
      case 'screw_wrench':
        _shape = 'extraShape'
        taskType = 'screw-wrench'
        break;
      case 'end_event_multiple':
        _shape = 'extraShape'
        taskType = 'end-event-multiple'
        break;
      case 'loop_marker':
        _shape = 'extraShape'
        taskType = 'loop-marker'
        break;
      case 'end_event_link':
        _shape = 'extraShape'
        taskType = 'end-event-link'
        break;
      case 'data_store':
        _shape = 'extraShape'
        taskType = 'data-store'
        break;
      case 'start_event_condition':
        _shape = 'extraShape'
        taskType = 'start-event-condition'
        break;
      case 'intermediate_event_throw_multiple':
        _shape = 'extraShape'
        taskType = 'intermediate-event-throw-multiple'
        break;
      case 'data_input':
        _shape = 'extraShape'
        taskType = 'data-input'
        break;
      case 'intermediate_event_catch_non_interrupting_message':
        _shape = 'extraShape'
        taskType = 'intermediate-event_catch-non-interrupting-message'
        break;
      case 'intermediate_event_none':
        _shape = 'extraShape'
        taskType = 'intermediate-event-none'
        break;
      case 'intermediate_event_catch_condition':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-condition'
        break;
      case 'parallel_mi_marker':
        _shape = 'extraShape'
        taskType = 'parallel-mi-marker'
        break;
      case 'lane_insert_above':
        _shape = 'extraShape'
        taskType = 'lane-insert-above'
        break;
      case 'end_event_terminate':
        _shape = 'extraShape'
        taskType = 'end-event-terminate'
        break;
      case 'intermediate_event_throw_message':
        _shape = 'extraShape'
        taskType = 'intermediate-event-throw-message'
        break;
      case 'start_event_signal':
        _shape = 'extraShape'
        taskType = 'start-event-signal'
        break;
      case 'intermediate_event_catch_non_interrupting_multiple':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-non-interrupting-multiple'
        break;
      case 'intermediate_event_catch_non_interrupting_timer':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-non-interrupting-timer'
        break;
      case 'intermediate_event_throw_compensation':
        _shape = 'extraShape'
        taskType = 'intermediate-event-throw-compensation'
        break;
      case 'manual':
        _shape = 'extraShape'
        taskType = 'manual'
        break;
      case 'intermediate_event_catch_compensation':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-compensation'
        break;
      case 'gateway_or':
        _shape = 'extraShape'
        taskType = 'gateway-or'
        break;
      case 'intermediate_event_catch_timer':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-timer'
        break;
      case 'start_event_none':
        _shape = 'extraShape'
        taskType = 'start-event-none'
        break;
      case 'start_event_compensation':
        _shape = 'extraShape'
        taskType = 'start-event-compensation'
        break;
      case 'start_event_non_interrupting_message':
        _shape = 'extraShape'
        taskType = 'start-event-non-interrupting-message'
        break;
      case 'lane_divide_two':
        _shape = 'extraShape'
        taskType = 'lane-divide-two'
        break;
      case 'user':
        _shape = 'extraShape'
        taskType = 'user'
        break;
      case 'intermediate_event_throw_signal':
        _shape = 'extraShape'
        taskType = 'intermediate-event-throw-signal'
        break;
      case 'start_event_non_interrupting_signal':
        _shape = 'extraShape'
        taskType = 'start-event-non-interrupting-signal'
        break;
      case 'start_event_message':
        _shape = 'extraShape'
        taskType = 'start-event-message'
        break;
      case 'end_event_message':
        _shape = 'extraShape'
        taskType = 'end-event-message'
        break;
      case 'start_event_non_interrupting_timer':
        _shape = 'extraShape'
        taskType = 'start-event-non-interrupting-timer'
        break;
      case 'business_rule':
        _shape = 'extraShape'
        taskType = 'business-rule'
        break;
      case 'start_event_error':
        _shape = 'extraShape'
        taskType = 'start-event-error'
        break;
      case 'hand_tool':
        _shape = 'extraShape'
        taskType = 'hand-tool'
        break;
      case 'sub_process_marker':
        _shape = 'extraShape'
        taskType = 'sub-process-marker'
        break;
      case 'intermediate_event_catch_non_interrupting_signal':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-non-interrupting-signal'
        break;
      case 'intermediate_event_catch_non_interrupting_parallel_multiple':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-non-interrupting-parallel-multiple'
        break;
      case 'intermediate_event_catch_non_interrupting_condition':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-non-interrupting-condition'
        break;
      case 'intermediate_event_catch_cancel':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-cancel'
        break;
      case 'ad_hoc_marker':
        _shape = 'extraShape'
        taskType = 'ad-hoc-marker'
        break;
      case 'intermediate_event_catch_escalation':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-escalation'
        break;
      case 'start_event_timer':
        _shape = 'extraShape'
        taskType = 'start-event-timer'
        break;
      case 'intermediate_event_catch_link':
        _shape = 'extraShape'
        taskType = 'intermediate-event-catch-link'
        break;
      case 'start_event_multiple':
        _shape = 'extraShape'
        taskType = 'start-event-multiple'
        break;
      case 'start_event_non_interrupting_multiple':
        _shape = 'extraShape'
        taskType = 'start-event-non-interrupting-multiple'
        break;
      case 'start_event_escalation':
        _shape = 'extraShape'
        taskType = 'start-event-escalation'
        break;
      case 'start_event_non_interrupting_condition':
        _shape = 'extraShape'
        taskType = 'start-event-non-interrupting-condition'
        break;
      case 'script':
        _shape = 'extraShape'
        taskType = 'script'
        break;
      case 'data_output':
        _shape = 'extraShape'
        taskType = 'data-output'
        break;
      case 'end_event_none':
        _shape = 'extraShape'
        taskType = 'end-event-none'
        break;
      case 'pool':
        _shape = 'rect';
        log.warn("asdnet pool", vert)
        break;

      case 'subpool':
        _shape = 'rect';
        log.warn("kkkaas line", vert)
        break;

      case 'endcircle':
        _shape = 'endcircle';
        break;
      case 'terminatecircle':
        _shape = 'simpleMessage'
        break;
      case 'doublecircle':
        _shape = 'doublecircle';
        break;
      default:
        _shape = 'person';
    }
    // Add the node
      g.setNode(vertex.id, {
      labelStyle: styles.labelStyle,
      shape: _shape,
      labelText: vertexText,
      labelSimpleText: vertexText,
      labelType: vertex.labelType,
      rx: radious,
      ry: radious,
      class: classStr,
      style: styles.style,
      id: vertex.id,
      link: vertex.link,
      linkTarget: vertex.linkTarget,
      tooltip: diagObj.db.getTooltip(vertex.id) || '',
      domId: diagObj.db.lookUpDomId(vertex.id),
      haveCallback: vertex.haveCallback,
      taskType: taskType,
      width: vertex.type === ('group' || 'subpool' || 'pool') ? 500 : undefined,
      dir: vertex.dir,
      type: vertex.type,
      props: vertex.props,
      padding: getConfig().flowchart.padding,
    });

    log.info('setNode', {
      labelStyle: styles.labelStyle,
      labelType: vertex.labelType,
      shape: _shape,
      labelText: vertexText,
      rx: radious,
      ry: radious,
      class: classStr,
      style: styles.style,
      id: vertex.id,
      domId: diagObj.db.lookUpDomId(vertex.id),
      width: vertex.type === 'group' ? 500 : undefined,
      type: vertex.type,
      dir: vertex.dir,
      props: vertex.props,
      padding: getConfig().flowchart.padding,
    });
  });
};

/**
 * Add edges to graph based on parsed graph definition
 *
 * @param {object} edges The edges to add to the graph
 * @param {object} g The graph object
 * @param diagObj
 */
export const addEdges = function (edges, g, diagObj) {
  log.info('abc78 edges = ', edges);
  let cnt = 0;
  let linkIdCnt = {};

  let defaultStyle;
  let defaultLabelStyle;

  if (edges.defaultStyle !== undefined) {
    const defaultStyles = getStylesFromArray(edges.defaultStyle);
    defaultStyle = defaultStyles.style;
    defaultLabelStyle = defaultStyles.labelStyle;
  }

  edges.forEach(function (edge) {
    cnt++;

    // Identify Link
    const linkIdBase = 'L-' + edge.start + '-' + edge.end;
    // count the links from+to the same node to give unique id
    if (linkIdCnt[linkIdBase] === undefined) {
      linkIdCnt[linkIdBase] = 0;
      log.info('abc78 new entry', linkIdBase, linkIdCnt[linkIdBase]);
    } else {
      linkIdCnt[linkIdBase]++;
      log.info('abc78 new entry', linkIdBase, linkIdCnt[linkIdBase]);
    }
    let linkId = linkIdBase + '-' + linkIdCnt[linkIdBase];
    log.info('abc78 new link id to be used is', linkIdBase, linkId, linkIdCnt[linkIdBase]);
    const linkNameStart = 'LS-' + edge.start;
    const linkNameEnd = 'LE-' + edge.end;

    const edgeData = { style: '', labelStyle: '' };
    edgeData.minlen = edge.length || 1;
    //edgeData.id = 'id' + cnt;

    // Set link type for rendering
    if (edge.type === 'arrow_open') {
      edgeData.arrowhead = 'none';
    } else {
      edgeData.arrowhead = 'normal';
    }

    // Check of arrow types, placed here in order not to break old rendering
    edgeData.arrowTypeStart = 'arrow_open';
    edgeData.arrowTypeEnd = 'arrow_open';

    /* eslint-disable no-fallthrough */
    switch (edge.type) {
      case 'double_arrow_cross':
        edgeData.arrowTypeStart = 'arrow_cross';
      case 'arrow_cross':
        edgeData.arrowTypeEnd = 'arrow_cross';
        break;
      case 'double_arrow_point':
        edgeData.arrowTypeStart = 'arrow_point';
      case 'arrow_point':
        edgeData.arrowTypeEnd = 'arrow_point';
        break;
      case 'double_arrow_circle':
        edgeData.arrowTypeStart = 'arrow_circle';
      case 'arrow_circle':
        edgeData.arrowTypeEnd = 'arrow_circle';
        break;
    }

    let style = '';
    let labelStyle = '';

    switch (edge.stroke) {
      case 'normal':
        style = 'fill:none;';
        if (defaultStyle !== undefined) {
          style = defaultStyle;
        }
        if (defaultLabelStyle !== undefined) {
          labelStyle = defaultLabelStyle;
        }
        edgeData.thickness = 'normal';
        edgeData.pattern = 'solid';
        break;
      case 'dotted':
        edgeData.thickness = 'normal';
        edgeData.pattern = 'dotted';
        edgeData.style = 'fill:none;stroke-width:2px;stroke-dasharray:3;';
        break;
      case 'thick':
        edgeData.thickness = 'thick';
        edgeData.pattern = 'solid';
        edgeData.style = 'stroke-width: 3.5px;fill:none;';
        break;
      case 'invisible':
        edgeData.thickness = 'invisible';
        edgeData.pattern = 'solid';
        edgeData.style = 'stroke-width: 0;fill:none;';
        break;
    }
    if (edge.style !== undefined) {
      const styles = getStylesFromArray(edge.style);
      style = styles.style;
      labelStyle = styles.labelStyle;
    }

    edgeData.style = edgeData.style += style;
    edgeData.labelStyle = edgeData.labelStyle += labelStyle;

    if (edge.interpolate !== undefined) {
      edgeData.curve = interpolateToCurve(edge.interpolate, curveLinear);
    } else if (edges.defaultInterpolate !== undefined) {
      edgeData.curve = interpolateToCurve(edges.defaultInterpolate, curveLinear);
    } else {
      edgeData.curve = interpolateToCurve(conf.curve, curveLinear);
    }

    if (edge.text === undefined) {
      if (edge.style !== undefined) {
        edgeData.arrowheadStyle = 'fill: #333';
      }
    } else {
      edgeData.arrowheadStyle = 'fill: #333';
      edgeData.labelpos = 'c';
    }

    edgeData.labelType = edge.labelType;
    edgeData.label = edge.text.replace(common.lineBreakRegex, '\n');

    if (edge.style === undefined) {
      edgeData.style = edgeData.style || 'stroke: #333; stroke-width: 1.5px;fill:none;';
    }

    edgeData.labelStyle = edgeData.labelStyle.replace('color:', 'fill:');

    edgeData.id = linkId;
    edgeData.classes = 'flowchart-link ' + linkNameStart + ' ' + linkNameEnd;

    // Add the edge to the graph
    log.warn('em: Graph at first:', graphlibJson.write(g));
    g.setEdge(edge.start, edge.end, edgeData, cnt);
    log.warn('em: Graph at last:', graphlibJson.write(g));
  });
};

/**
 * Returns the all the styles from classDef statements in the graph definition.
 *
 * @param text
 * @param diagObj
 * @returns {object} ClassDef styles
 */
export const getClasses = function (text, diagObj) {
  log.info('Extracting classes');
  diagObj.db.clear();
  try {
    // Parse the graph definition
    diagObj.parse(text);
    return diagObj.db.getClasses();
  } catch (e) {
    return;
  }
};

/**
 * Draws a flowchart in the tag with id: id based on the graph definition in text.
 *
 * @param text
 * @param id
 */

export const draw = async function (text, id, _version, diagObj) {
  log.info('Drawing flowchart');
  diagObj.db.clear();
  flowDb.setGen('gen-2');
  // Parse the graph definition
  diagObj.parser.parse(text);

  // Fetch the default direction, use TD if none was found
  let dir = diagObj.db.getDirection();
  if (dir === undefined) {
    dir = 'TD';
  }

  const { securityLevel, flowchart: conf } = getConfig();
  // const nodeSpacing = conf.nodeSpacing || 50;
  // const rankSpacing = conf.rankSpacing || 50;

  const nodeSpacing = 40;
  const rankSpacing = 5;

  // Handle root and document for when rendering in sandbox mode
  let sandboxElement;
  if (securityLevel === 'sandbox') {
    sandboxElement = select('#i' + id);
  }
  const root =
    securityLevel === 'sandbox'
      ? select(sandboxElement.nodes()[0].contentDocument.body)
      : select('body');
  const doc = securityLevel === 'sandbox' ? sandboxElement.nodes()[0].contentDocument : document;

  // Create the input mermaid.graph
  const g = new graphlib.Graph({
    multigraph: true,
    compound: true,
  })
    .setGraph({
      rankdir: dir,
      nodesep: nodeSpacing,
      ranksep: rankSpacing,
      marginx: 0,
      marginy: 0,
    })
    .setDefaultEdgeLabel(function () {
      return {};
    });

  let subG;
  const subGraphs = diagObj.db.getSubGraphs();
  log.warn('Subgraphs - ', subGraphs);

  for (let i = subGraphs.length - 1; i >= 0; i--) {
    subG = subGraphs[i];

    log.warn('Subgraph - ', subG);
    diagObj.db.addVertex(
      subG.id,
      { text: subG.title, type: subG.labelType },
      subG.groupType,
      [
        'fill:transparent'
      ],
      subG.classes,
      subG.dir
    );
  }

  // Fetch the vertices/nodes and edges/links from the parsed graph definition
  const vert = diagObj.db.getVertices();

  const edges = diagObj.db.getEdges();

  log.info('Edges', edges);
  let i = 0;
  for (i = subGraphs.length - 1; i >= 0; i--) {
    // for (let i = 0; i < subGraphs.length; i++) {
    subG = subGraphs[i];

    selectAll('cluster').append('text');

    for (let j = 0; j < subG.nodes.length; j++) {
      log.warn('Setting up Parent subgraphs', subG.nodes[j], subG.id, subGraphs);
      g.setParent(subG.nodes[j], subG.id);
    }
  }

  log.warn('Graph at first:::11', JSON.parse(JSON.stringify(g)));
  addVertices(vert, g, id, root, doc, diagObj);
  console.log('em: bef addedges: Graph at first:', JSON.parse(JSON.stringify(g)));
  addEdges(edges, g, diagObj);
  console.log('em: aft addedges: Graph at first:', JSON.parse(JSON.stringify(g)));

  // Add custom shapes
  // flowChartShapes.addToRenderV2(addShape);

  // Set up an SVG group so that we can translate the final graph.
  const svg = root.select(`[id="${id}"]`);

  // Run the renderer. This is what draws the final graph.
  const element = root.select('#' + id + ' g');
  await render(element, g, ['point', 'circle', 'cross'], 'flowchart', id);

  utils.insertTitle(svg, 'flowchartTitleText', conf.titleTopMargin, diagObj.db.getDiagramTitle());

  setupGraphViewbox(g, svg, conf.diagramPadding, conf.useMaxWidth);

  // Index nodes
  diagObj.db.indexNodes('subGraph' + i);

  // Add label rects for non html labels
  if (!conf.htmlLabels) {
    const labels = doc.querySelectorAll('[id="' + id + '"] .edgeLabel .label');
    for (const label of labels) {
      // Get dimensions of label
      const dim = label.getBBox();

      const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('rx', 0);
      rect.setAttribute('ry', 0);
      rect.setAttribute('width', dim.width);
      rect.setAttribute('height', dim.height);

      label.insertBefore(rect, label.firstChild);
    }
  }

  // If node has a link, wrap it in an anchor SVG object.
  const keys = Object.keys(vert);
  keys.forEach(function (key) {
    const vertex = vert[key];

    if (vertex.link) {
      const node = select('#' + id + ' [id="' + key + '"]');
      if (node) {
        const link = doc.createElementNS('http://www.w3.org/2000/svg', 'a');
        link.setAttributeNS('http://www.w3.org/2000/svg', 'class', vertex.classes.join(' '));
        link.setAttributeNS('http://www.w3.org/2000/svg', 'href', vertex.link);
        link.setAttributeNS('http://www.w3.org/2000/svg', 'rel', 'noopener');
        if (securityLevel === 'sandbox') {
          link.setAttributeNS('http://www.w3.org/2000/svg', 'target', '_top');
        } else if (vertex.linkTarget) {
          link.setAttributeNS('http://www.w3.org/2000/svg', 'target', vertex.linkTarget);
        }

        const linkNode = node.insert(function () {
          return link;
        }, ':first-child');

        const shape = node.select('.label-container');
        if (shape) {
          linkNode.append(function () {
            return shape.node();
          });
        }

        const label = node.select('.label');
        if (label) {
          linkNode.append(function () {
            return label.node();
          });
        }
      }
    }
  });
};

export default {
  setConf,
  addVertices,
  addEdges,
  getClasses,
  draw,
};
