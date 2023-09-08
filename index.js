import { layout as dagreLayout } from 'dagre-d3-es/src/dagre/index.js';
import * as graphlibJson from 'dagre-d3-es/src/graphlib/json.js';
import insertMarkers from './markers.js';
import { updateNodeBounds } from './shapes/util.js';
import {
  clear as clearGraphlib,
  clusterDb,
  adjustClustersAndEdges,
  findNonClusterChild,
  sortNodesByHierarchy,
} from './mermaid-graphlib.js';
import {
  insertNode,
  positionNode,
  clear as clearNodes,
  setNodeElem,
  fixPoolHeightAndWidth
} from './nodes.js';
import { positionCluster, insertCluster, clear as clearClusters } from './clusters.js';
import { insertEdgeLabel, positionEdgeLabel, insertEdge, clear as clearEdges } from './edges.js';
import { log } from '../logger.js';

export let labelWidthController = []

const recursiveRender = async (_elem, graph, diagramtype, parentCluster, rootGraph) => {
  log.warn('Graph in recursive render: XXX', graphlibJson.write(graph), parentCluster);
  const dir = graph.graph().rankdir;
  log.trace('Dir in recursive render - dir:', dir);

  const elem = _elem.insert('g').attr('class', 'root');
  if (!graph.nodes()) {
    log.info('No nodes found for', graph);
  } else {
    log.info('Recursive render XXX', graph.nodes());
  }
  if (graph.edges().length > 0) {
    log.trace('Recursive edges', graph.edge(graph.edges()[0]));
  }
  const clusters = elem.insert('g').attr('class', 'clusters');
  const edgePaths = elem.insert('g').attr('class', 'edgePaths');
  const edgeLabels = elem.insert('g').attr('class', 'edgeLabels');
  const nodes = elem.insert('g').attr('class', 'nodes');

  // Insert nodes, this will insert them into the dom and each node will get a size. The size is updated
  // to the abstract node and is later used by dagre for the layout
  await Promise.all(
    graph.nodes().map(async function (v) {
      const node = graph.node(v);
      log.warn("?????after set node chis mige", v, "nde==", node, "par", parentCluster)

      if (parentCluster !== undefined) {
        const data = JSON.parse(JSON.stringify(parentCluster.clusterData));
        // data.clusterPositioning = true;
        log.info('Setting data for cluster XXX (', v, ') ', data, parentCluster);
        graph.setNode(parentCluster.id, data);

        if (!graph.parent(v)) {
          log.trace('Setting parentis', v, parentCluster.id);

          graph.setParent(v, parentCluster.id, data);
        }
        // if (parentCluster.id == "PPPPOOL3") {
        //   log.trace('Setting parentis', v, parentCluster.id);
        //
        //   graph.setParent(v, node, data);
        // }


      }
      log.info('(Insert) Node XXX' + v + ': ' + JSON.stringify(graph.node(v)));
      if (node && node.clusterNode) {
        // const children = graph.children(v);
        log.info('Cluster identified', v, node.width, graph.node(v));
        log.warn("rec called node", node, "v:", v, "nodes:",nodes, "node.graph:",node.graph, "diagramType:",diagramtype, "graph node v:",graph.node(v))
        const o = await recursiveRender(nodes, node.graph, diagramtype, graph.node(v), rootGraph);
        log.warn("rec2 after", node, "v:", v, "nodes:",nodes, "elem width:",o.elem.node().getBBox(), "elem",o.elem.node(), "graph node v:",graph.node(v))
        log.warn("vvvvrec2 after", node, "v:", v, "elem",o.elem.node(), o.elem.node().getBBox())

        const newEl = o.elem;
        updateNodeBounds(node, newEl);

        node.diff = o.diff || 0;
        // log.warn("cheerrraaa", node)
        log.info('Node bounds (abc123)', v, node, node.width, node.x, node.y);
        setNodeElem(newEl, node);
        // if (node.externalConnections) {
        //   insertCluster(clusters, graph.node(v))
        // }
        log.warn('Recursive render complete ', newEl, node);
      } else {
        if (graph.children(v).length > 0) {
          // This is a cluster but not to be rendered recursively
          // Render as before
          log.warn('Cluster - the non recursive path XXX', v, node.id, node, graph);
          log.info(findNonClusterChild(node.id, graph));
          console.log("mam bef", JSON.parse(JSON.stringify(clusterDb)))
          clusterDb[node.id] = { id: findNonClusterChild(node.id, graph), clusterData: graph.node(node.id), node };
          console.log("mam aft", JSON.parse(JSON.stringify(clusterDb)))
          // insertCluster(clusters, graph.node(v));
        } else {
          log.warn('!@Node - the non recursive path', v, node);
          if (node != undefined) {
          //   if (parentCluster.id != "PPPPOOL3") {
              await insertNode(nodes, graph.node(v), dir);
            // } else {
            //   log.warn(":9u9u", node)
            // }
          }
        }
      }
    })
  );
  log.warn("RRR@", graph.nodes())
  // Insert labels, this will insert them into the dom so that the width can be calculated
  // Also figure out which edges point to/from clusters and adjust them accordingly
  // Edges from/to clusters really points to the first child in the cluster.
  // TODO: pick optimal child in the cluster to us as link anchor
  graph.edges().forEach(function (e) {
    const edge = graph.edge(e.v, e.w, e.name);
    log.warn('WARN@EDGE ' + e.v + ' -> ' + e.w + ': ', e, ' ', JSON.stringify(graph.edge(e)));

    // Check if link is either from or to a cluster
    log.info('Fix', clusterDb, 'ids:', e.v, e.w, 'Translateing: ', clusterDb[e.v], clusterDb[e.w]);
    insertEdgeLabel(edgeLabels, edge);

  });

  graph.edges().forEach(function (e) {
    log.info('Edge ' + e.v + ' -> ' + e.w + ': ' + JSON.stringify(e));
  });
  log.info('#############################################');
  log.info('###                Layout                 ###');
  log.info('#############################################');
  log.warn("#############################################", graph);

  dagreLayout(graph);


  log.warn('Graph after layout:', graphlibJson.write(graph));
  // log.warn("graaaph",JSON.stringify(graphlibJson.write(graph)))
  // Move the nodes to the correct place
  let diff = 0;
  sortNodesByHierarchy(graph).forEach(function (v) {
    const node = graph.node(v);
    log.warn('HASDHASD ' + v + ': ' + node);

    if (node != undefined) {


    log.warn('REWPosition ' + v + ': ' + JSON.stringify(graph.node(v)));

    log.warn(
      'Position ' + v + ': (' + node.x,
      ',' + node.y,
      ') width: ',
      node.width,
      ' height: ',
      node.height
    );
    log.warn(
      'VVPPPPosition ' + v + ': (' + node.x,
      ',' + node.y,
      ') width: ',
      node.width,
      ' height: ',
      node.height, node
    );
    if (node && node.clusterNode && node.externalConnection) {
      log.warn("joonemadatr", node, graph, JSON.stringify(node.height))
      // node.labelText = node.clusterData.labelText
      // node.labelStyle = node.clusterData.labelStyle
      // node.labelType = node.clusterData.labelType
      // node.labelSimpleText = node.clusterData.labelSimpleText
      node.clusterData.height = node.height
      node.clusterData.width = node.width
      node.clusterData.x = node.x
      node.clusterData.y = node.y
      node.clusterData.clusterNode = true
      node.clusterData.diff = node.diff
      node.clusterData.diff = node.diff
      //mode 1
      // positionNode(node.clusterData);
      insertCluster(clusters, node.clusterData);
      node.labelWidth = node.clusterData.labelWidth
      //mode 2
      // insertCluster(clusters, node.clusterData);
      // positionCluster(node.clusterData);

      // positionNode(node.clusterData);
    } if (node && node.clusterNode && !node.externalConnection) {
      // clusterDb[node.id].node = node;
      log.warn("!!!!!nide1 cluster node", node, labelWidthController);
      if (node.clusterData.type == 'pool') {
        node.clusterData.height = node.height
        node.clusterData.width = node.width
        node.clusterData.x = node.x
        node.clusterData.y = node.y
        node.clusterData.clusterNode = true
        node.clusterData.diff = node.diff
        node.clusterData.diff = node.diff
        // node.clusterData.labelWidth = node.labelWidth

        positionNode(node.clusterData);

        log.warn("!!!!!nide2 cluster node", node);
        // clusterDb[node.id].node = node.clusterData;
        insertCluster(clusters, node.clusterData);

      } else {
        positionNode(node);
      }
    } else {
      // Non cluster node
      if (graph.children(v).length > 0) {
        // A cluster in the non-recursive way
        // positionCluster(node);
        log.warn("!!!!!nude cluster node", node, clusterDb);
        if (node.type != 'pool') {
          insertCluster(clusters, node);
          log.warn("nianiabia", node, node.labelWidth)
          // node.height = fixPoolHeightAndWidth(node.id, "else")
        }

        clusterDb[node.id].node = node;
      } else {
        log.warn("!!!!!nade inja chi nude cluster node", node);
        positionNode(node);
      }
    }
  }
  });
  log.warn("VVPPPRgraph.node", graph.nodes(), "_____", rootGraph)
  // Move the edge labels to the correct place after layout
  graph.edges().forEach(function (e) {
    const edge = graph.edge(e);
    log.warn('VVPPPPositionWARN@Edgw ' + e.v + ' -> ' + e.w + ': ' + JSON.stringify(edge.points), edge, graph.node(e.v), graph.node(e.w));
    if (graph.node(e.v) != undefined && graph.node(e.w) != undefined) {
      // if (e.v == "hsd") {
      //   var paths = insertEdge(edgePaths, e, edge, clusterDb, diagramtype, graph);
      // } else {
        var paths = insertEdge(edgePaths, e, edge, clusterDb, diagramtype, graph);
      // }
      positionEdgeLabel(edge, paths);
    }
  });

  graph.nodes().forEach(function (v) {
    const n = graph.node(v);
    if (n != undefined) {
      log.info(v, n.type, n.diff);
      if (n.type === 'group') {
        diff = n.diff;

      }
    }
  });
  return { elem, diff };
};

export const render = async (elem, graph, markers, diagramtype, id) => {
  insertMarkers(elem, markers, diagramtype, id);
  clearNodes();
  clearEdges();
  clearClusters();
  clearGraphlib();

  adjustClustersAndEdges(graph);
  await recursiveRender(elem, graph, diagramtype, undefined, graph);
};

// const shapeDefinitions = {};
// export const addShape = ({ shapeType: fun }) => {
//   shapeDefinitions[shapeType] = fun;
// };

// const arrowDefinitions = {};
// export const addArrow = ({ arrowType: fun }) => {
//   arrowDefinitions[arrowType] = fun;
// };
