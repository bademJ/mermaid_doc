import { select } from 'd3';
import { log } from '../logger.js';
import {labelHelper, updateNodeBounds, insertPolygonShape, insertXPolygonShape} from './shapes/util.js';
import { getConfig } from '../config.js';
import intersect from './intersect/index.js';
import createLabel from './createLabel.js';
import note from './shapes/note.js';
import { parseMember } from '../diagrams/class/svgDraw.js';
import { evaluate } from '../diagrams/common/common.js';
import {sanitizeUrl} from "@braintree/sanitize-url";
import {subPoolPar} from "../diagrams/flowchart/flowDb.js";
import {pngDict} from "./bpmn_icons.js";
import {createText} from "../rendering-util/createText.js";
import {labelWidthController} from "./index.js";
export let poolHeightCosumer = [];
export let lineHeightPos = {};

const question = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const s = w + h;
  const points = [
    { x: s / 2, y: 0 },
    { x: s, y: -s / 2 },
    { x: s / 2, y: -s },
    { x: 0, y: -s / 2 },
  ];

  log.info('Question main (Circle)');

  const questionElem = insertPolygonShape(shapeSvg, s, s, points);
  questionElem.attr('style', node.style);
  updateNodeBounds(node, questionElem);

  node.intersect = function (point) {
    log.warn('Intersect called');
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};


const person = async (parent, node) => {

  var personWidth = 23.7 * 2
  var personHeight = 20 * 2

  node.shapeWidth = personWidth
  node.shapeHeight = personHeight
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, undefined, true);

  // const totalWidth = bbox.width + node.padding;
  // const totalHeight = bbox.height + node.padding;

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;

  let personImg =
    'data:image/png;base64,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';
  const xQuestionElem = drawImage(
    shapeSvg,
    personWidth,
    personHeight,
    -personWidth / 2,
    -personHeight / 2,
    personImg
  );

  // const text = shapeSvg
  //   .append('text')
  //   .attr('x', 0)
  //   .attr('y', 40)
  //   .attr('width', 10)
  //   .attr('class', 'commit-label')
  //   .text(node.labelSimpleText);


  xQuestionElem.attr('style',   node.style);
  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(shapeSvg, node.props.borders, w, h)
      propKeys.delete('borders');
    }
    propKeys.forEach((propKey) => {
      log.warn(`MO Unknown node property ${propKey}`);
    });
  }



  log.info('XQuestion main (Circle)');
  //
  updateNodeBounds(node, shapeSvg);

  //
  // xQuestionElem.attr('style',   node.style);
  // updateNodeBounds(node, xQuestionElem);


  node.intersect = function (point) {
    log.warn('Mew Simple Message intersect', node, "__q12__",node, point, bbox.width, "XX" ,bbox.height);
    return intersect.costumeRect(node, 0, bbox.height/2, 0, point);
  };



  return shapeSvg;

};



const extraShape = async (parent, node) => {

  var personWidth = 23.7 * 2
  var personHeight = 23.7 * 2

  node.shapeWidth = personWidth
  node.shapeHeight = personHeight
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, undefined, true);

  // const totalWidth = bbox.width + node.padding;
  // const totalHeight = bbox.height + node.padding;

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;

  let nodeImg = pngDict[node.taskType]
  const xQuestionElem = drawImage(
    shapeSvg,
    personWidth,
    personHeight,
    -personWidth / 2,
    -personHeight / 2,
    nodeImg
  );

  // const text = shapeSvg
  //   .append('text')
  //   .attr('x', 0)
  //   .attr('y', 40)
  //   .attr('width', 10)
  //   .attr('class', 'commit-label')
  //   .text(node.labelSimpleText);


  xQuestionElem.attr('style',   node.style);
  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(shapeSvg, node.props.borders, w, h)
      propKeys.delete('borders');
    }
    propKeys.forEach((propKey) => {
      log.warn(`MO Unknown node property ${propKey}`);
    });
  }



  log.info('XQuestion main (Circle)');
  //
  updateNodeBounds(node, shapeSvg);

  //
  // xQuestionElem.attr('style',   node.style);
  // updateNodeBounds(node, xQuestionElem);


  node.intersect = function (point) {
    log.warn('Mew Simple Message intersect', node, "__q12__",node, point, bbox.width, "XX" ,bbox.height);
    return intersect.costumeRect(node, 0, bbox.height/2, 0, point);
  };



  return shapeSvg;

};




const personTask = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(
    parent,
    node,
    'node ' + node.classes,
    true
  );

  // add the rect
  const rect = shapeSvg.insert('rect', ':first-child');

  // const totalWidth = bbox.width + node.padding * 2;
  // const totalHeight = bbox.height + node.padding * 2;
  const totalWidth = bbox.width + node.padding ;
  const totalHeight = bbox.height + node.padding ;
  rect
    .attr('class', 'basic label-container')
    .attr('style', node.style)
    .attr('rx', node.rx)
    .attr('ry', node.ry)
    .attr('x', -bbox.width / 2 - halfPadding)
    .attr('y', -bbox.height / 2 - halfPadding)
    // .attr('x', -bbox.width / 2 - halfPadding - 30)
    // .attr('y', -bbox.height / 2 - halfPadding - 30)
    // .attr('width', 4/3 * totalWidth)
    // .attr('height', totalHeight + (totalWidth / 3));
    .attr('width', totalWidth)
    .attr('height', totalHeight);

  let personImg =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAB3RJTUUH5QYEEyIIPXaRXQAAActQTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2/kREgAAAJh0Uk5TAAECAwQFBgcICQ8QERITFhcdHyAhIyQlJykqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFSUpPUFNXWFleX2NlaGlqa2xucnR1dnd4eXp7fH1+gIGKi5iZrK23uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drk5ebn6Onq6+zt8PHy8/T29/j5+vv8/f5xFqGvAAAAAWJLR0SYdtEGPgAAEYRJREFUeNrlnftfE8cahzczWy9AkCJUEMI1IIQ7Sk/bc3rac3raSlAD2J7WIxclBAgJd7mJ1KqooNRAgGT/3EO4aHbzzl5ndzab+c2PS3bn3dmZ7zvzPu/LcczapeKBaEwQYtGB4ktc7jVU9MuWcNa2filCudZ/XP9QSGsP63GO9b9lJpFugMRMS05ZgO+cOhRE7XCqk8+h/t8MxQVJi4du5owF+J7gvpDR9oM9OWIB/tYY0P9jC4zdygkL8F3jYP+PLTDelQMWwK2TcYHQ4pOtjl8LUGP0QCC2g2ijwxWRy7N4JMi0o0WPy9Hv3/MsKci25DOPg8cAqnwuKLbnlY61AK5bEVS0lTqHzoS4eTahxgCJ2WZHWoDvCB8KqtphuMOBegDS/4KwF4nsAXrAgX4BrP/3hru7h/dywS+A9f/+aCvPt47uO98v4Luh938QTM12uDl4AI2BbgdZALdNAN//0dTpPhiunwLUYXyizTFrAboRgfT/fMWZ4kEV85BfELnhEEWEqhcg/f+s5KPqd5U8g/yChWpHWAB5ngL6P7Fckn5RyTKgkZJPneAXwPr/MFom8vpcZdFDZ/oFuGYN2vkISUc3qoZ0krBWk+UzIW6aB8b//uPGjH7hxsfASpmcb8pqC/Dt08DI3huBTkFwywigCQ+n27NYD/DdE8D6tzfUDr5V3D4EWOBgInsVEX8rGAf7z5PGC2SBeDBbVTFB/4+0EfvDt404yC8g6P8xn8yshn1jjvELcDuo/ye9srM69k6CfkF71q0FuGkaeJfJWSVthzyzwLp5MJ1tqyGqmYOU3XqporJDpeuQcpyrySpNiCrXIG2/WqLi1MNVsgr5DmvZpIqRB9T/M9dUnfq4rs2AfkH2eEaoagPS/xNVSO3fQ/OnsFGVJRbANxZA/d+g+vlRA+gXLNzIipmQb4scQfrfp+HpsQ/yC44ibVmgB0j6X9sOH27LVr+AvzWuSf+T/UjQLxi3uyrme7Tqf61+gb1PTPibkP6PP/bpmL2w73Ec8gvsfGqGO0JA/w8nGnTN3rhhAtAD+6EO264F2BcG3llyRu/6japmgPU0HvbZ1AKobhZScKvXdOsXdG0VUpSzdbZURK7KFXBvv8RA1JOrBDxTWKm0YSSVC9T/R3Olhp7VVTp3BPoFtrMAqtyEzvemjPpwqHIKOlfctJtviBsWwehfr+HnRF4wsnixwVYzId8ahfT/KI1oJ9w8CvkF0VYb6QG+a5KC/tfoF0zaJ7Kalv7PVr+AoP+H6Z1p8e3DNvYLCPr/EU0KCrc8sq1fgDsh/uEw1Eh1lsaNIcgvGO9kvhbgling3SQitM/1cU0E0JnxKda0HfKCO7hPyqjrFFT2BNxp9jJVRK6KJwn5+CeK9wIjqRJPKhiqYoL+ny8x53Yl8zbzC1AF1P+DsFnvxFURhvyC5xWMvgLshb7KeLDetOdB9VDEhfDEy2QmlPLP5/HPZp7j4iYospoNeZ3JP5/Gv5tL/uFWKLqeBXnN3zRX/2v1C6zWhAT+edj8mDaCX2AxYQHHP8UfWUG+4lbQL7A0kgrmnw/GrTm9xTfGD9iS1zD/nJiutWguxrXTCZbkNWoA+efFcq3rP//FV/85bv8o0/rqUPkiSF43WKKIXJUg/7ypWf9f6t95/+G47e70a80j5CrZBMlrK84LXB7o3olF7fr/m49nHske7X7BIuSFbZrvF8D8w8F0ueY7u3779Pe/af/r8ukDFoQFzD/Hx2u139eYAThUCykxs8lr7IP45/1HetY/gwY4Xg0fQX7BrJlnxzD/rFP/GzUAyS8wkbwm8M9D+iKZDRuAQFiYR15T1v/GDWCxX0DQ/6N6z+goGIDjW0ct8wv4blD/B3Xvf9AwAIebQPJ6nH48IYF/DuvPA0jFAByuD1tCXivxz8wMYBF5jaqU+GdmBiCS1zRjy5FnA4pVeiKr//Hn//x39WXjBrjcHPjXF7IDugQ6nUlu0OMLCPxzpEzuvV3oiQrCzu1ClzEDuAr9MUF48rcLcmOgLGIqeU3in2UpngtfLqWuivUWGjNAYW8sdcHSl3IWQDVmkte4aQ7U/7Ln3xe+PNuyiPXlGzFAfl/sbLtF1gK4EfQL5micURD452HZswjcs3R+Zcyfp98Aef7Y+SVLPbI3bBk2ibzWxj+ft89nPl2721eg1wAFfbufrpn5XLtfYJyw0Mo/n7Xv0q/eDrj1GcAd2E7/ne8URqoZ5DUp/5ES//CDaEHaGnDrMYB7YEu0+P6g8Kxt9DMykfhnxfjH6h2RBV4MurUbwD34QtT/P68pzdbNtMlrAv88pXwaffl2TNECCgaQ9j/282eKz+udokpeE/jnOTX6otAvtsCrQIE2AxQEXon77y9Uo9jmKJLXqGYe0ldPS9XoK1dhn9gCb/vytBggr++tuP99hWrcBVT6FNKs83rIa1S5ltTLP59IGP9for/c9eerN0C+f1f0x3/589V6RhB5ndRBXhvjn09f4rbsSyQbIGP4bPflqfYNKZHXqPqpIf759DMWL2MSv4BsgDP9/2kZDRRo8dxB8vqptrxkxvnn04n8pWQiK1BjgALJBPpy0K3p3VEgr2nwzycWuC+xQPpQJhkgTzL+X953a1y9DJPXdPjn0zEg/go+pE1mBAPk+z+Ix/+gW+tdjZLXOvU/bIF+kZwXdu655Q3gvicSkcJ2v1v7XY35BfT45wyHTuQXgAaQ6n+SK6n4Desnr2nyzxKXXjylQQbInDbz9N1VP3lNl38WbepI/ALAABn6vy9f7131kte4mS7/DPoF/QWwAQr6deh/sh6AyWt5T5Y+//xxYzfNAm/u5EMGyL/zRtp/IwEveshrBPPP60b5h4I+0dImvOvNyzRAXu870UUf9M1/6X7BOkxeEy1A4B9mSw1HHuX5dyQft9slNoDLLZkqdvTOf2n9KZ3VRFggD3TGdDBJ44QlP/Ba6heIDSDV/68D+cbvijwQ0SoQqnjgxsWkOfwzvMAVphug0Jj+J1oAJK+Ti9CZBoF/HqEVc5ThF9x58OkfD+4Y1P8a/QKAvDaXfz4dA5JFLu3AbU2yUA66ad1VLXltNv986he8FVS1t/1uendVR16T9D9d/qHgzns1/X9/p4DmXfl2Zb+ApP9ps0j54qkObjF/Pt274hYlvwB3hizgn4HNDrD/fXm070ogr0Pn5DWBf45WmxBz6lYaAzG/m/5dcXVUhrxG9eA+6nKZGXHXUr8gs/+FZgS8o7JlcI+7PPWfRQ8p8c8uVa3wrowFYncL1f2Kdr8AJK//V8Rxl36lwz9f+ua/6trva2QDrP2u8ke+0VyrGiavf73EFW9B+Y808898f1KwsCX7tS7QrgooI9NWMReAVgjt/HPZjmBp2/lC8zxQD631AS5IJ//Rt7vWGuD9V9rXAigjU5CL0eEffvxgrQE+/KhjNQQIixiX8dMRXREV2WAAju+OZPwQYIAu5xqgCzBA5icw5NxPYAj4BIBJcKTJmZNg0wg0CULL4Jgzl8ExcBksfp3LQuh1MXfRD0nhOe1SuOc3de3BOrlf6w9U/ogOKQwmJ/VfJDlDG05zhqCSB4mHRan/LJ+1KB0YS3cYTEQ2W362IRIGE8KZsiHSq7Qh0mvKhgiYii58vuWX61tiJ0ExpieFPNkU7VWzKdpLfVMUTkeZvjFOwoLbKG+Lv1OzxL2jvC3epgYwtuZg5I26Rf6N9QcjTI7G0vTAOvOjsdRIgQ9Hm2kdjkrjf+6mH47eVeYL9PW/GT4chb5t3LgEhsdSOh4f0HY8PkDpeBwMm12C1zcEJsihFCBxbysj/kccICGxwNY98wIkNkk9IoTIzGRviMyMxiSkqHIVCpJaox0k9d4PBUn539MOkoKQj8SqHDyB6sAygSt0w+TeksLk3tINk4NSHh3OyRcowT4QlIoaCpTs1Rso2WsoUDIKAlRKIT+4AwIuaIbKvpQLlX1pbqhsfEK5SJHpwdL35YKl7zMPlqbtF0jD5V8PyofLD76mEy5vJMEQTb/AHRAHRu0ElICJgHh39W2AHjChuiQF3z1JDZl5ZRSZeUUNmZlUf+TFt4PQ1LBmaCoj/l8HNKXZL8C+YRCa0jKCKWFzAy9oYHMvBizH5lLgJFg4NmQInPSrBSf9hsBJMKHKRrVWdBRGZ6P2R2ejlIoWo0oIN0iuqIenxaeFhuDpXfXw9Ar01Ot6UgoR8Pl1ffj8tlZ8flsfPg8WLp/XV7icVEBeVQIFKf/crzWBQv+Wdr8AVdItXU9IoTGpPYXGSz0pNCSq+PZlxef1TlJNoXFSREBfEhXvjjL/oJhEReIX7HgV9//AJCqGSg8Q/AJFjPYn8fgf1JdGR0Je/6Sk/0dMSDDK9+jyC/6efjWtREpf69L/RhOs8jf1oPTpqbT+MpJKKy0PSeiKDv0/YTzFLt9hk2RqnUj2/A9OpkYjyTJunof8gixIp5ecp3Oqg2shdREfl1UXF88SKvqNJlT0nyVUvCir2cBE6+u0Sl7oTKl5PA/8+bPxlJq3j5fUUCfLlJp6k6pe+fr7azL5v9QmVf3s2vdfX5HtiulJVVM+JlhWY8MeaXUhz/1osYpuYmE4sfLcdfaJla/PQSealBMrp9bZSTC1Xh3r1Np1YAq9yTbq8U2E5OpjrJOrj1mUXJ0USbXPOr3+vlL8E0UL9ARpxhFRKbAAJ0wyq/AafzOkI8WueQYgpNINmVd6j+8Ma/cLTDMAQf+HzSy+iH1gmu1RNmV2wPKbcz5zCw3VQcl54kEWhZbAAqyrdSaXnCOU2gpbX2orzKTUViqS6g8o8n7hquZfMlRs7eoCRDn84bGk3NwSWG7jqo5ye7t6y+1dBctqLFlThBo1ggUXF7QXXCz79sfj9q2OgosL0HcYbbSoBDVuBVNOhK0ruRkGE0K0WlZ+mVB0NWhV0dUg46KrRMJi1IoS2LhlNG6d/pfxC3K68HJqDITsVHo7dMv64uNw8fUhs4uvD9mk+HrqW4TKb+6NNploAdwEJIEQErMtmGPQsBdKzrM/VmfaaozqIP5ZWPYy6X+q0BvoF0xdN0mPua5Pgfq/AnGMmqvqOR3yWl2D+efnVS6OWXNVLCdonxcQ7wXzz8sVDPufopKsIq9J/LMXcUwbIRVdpIbyvIRrIjIJ4ZhaACavx+mS17hxXIF/ZtesIK/V8M8MLWA6eW2Mf7BiDJhLXhvlH6zYH5gykbwmxD9Nddmm/+S01DRidEj8c6uN+n9CXoN+gfFVGk4PLiw1Ys5WDYG75QeTRvfpUSXIP//hQZzNmjnFCbSWCGBqAZi8NlSeglAkYrXShv03g7zWxz8znAl9YarkNYF/DvswZ9N27BdA5HVIH3mNG6D8R3Fb6H+iHqBIXhvhn53gF9hd/5vtF9hf/xOfnAp5bZx/ZmiBNuPkNYl/bsuC/qdObxcNktcE/nnxBuayoqEqkLxWXbKWUDh2owpxWdKMkdf0+GeGFjBAXtPknxlaoBYkr9eUyWtUugbyz7VZ1f/UPg5IXs8ojWPkmQH552bMZVmDMzIpkdck/rkj6/pPJK8fy71L3PyYOv9sO79Ahrw2h39maQFtfoFZ/DPLr0ALeW0e/8zQAu3qyWsS/9yexf1PRTWpJa9J/HMT5rK64RqQvA5J8xqhajD/0XpNlvdfLXltPv/M0jNSQV5bwD8ztED1ggJ5TeCfF6od0X8yeX0e34cqrOGfGc6E7TB5XX8yw+F6mH9ux5xjmhx5bSX/zNACMHk90srzrSMW8s9MPSPQL+jqspZ/tp1fEIk4Tv8TLQBmZIIanfxHNlwLQPLaev6ZoQVA8tp6/tlufoET9T/ZL9hUqMqX3PQ4uP9E8tpy/pnhGIDJa8v5Z4YzIZiRybz8RzbUAyB5bT3/bDe/wIn6X8YvcNT5h54xkLkDyoJ/ZmiBjIxM5uY/suFaICGvWfHPDC1Q/jDdAA/Lc6z/x63I/7Hm9Wt/EZeD7WJxIBgThFgwUHyR3VP8HwNUrbcDraeGAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIxLTA2LTA0VDE5OjM0OjA4KzAwOjAw6yUmJAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMS0wNi0wNFQxOTozNDowOCswMDowMJp4npgAAAAASUVORK5CYII='
    // 'data:image/png;base64,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';
  log.warn("halph chie?", halfPadding, bbox.width, node.labelText)
  var personWidth = 30
  var personHeight = 30
  const personElem = drawImage(
    shapeSvg,
    personWidth,
    personHeight,
    -bbox.width / 2 - personWidth - (halfPadding/4),
      -bbox.height / 2 - personHeight - (halfPadding/4),
    personImg
  );

  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect, node.props.borders, totalWidth, totalHeight);
      // propKeys.delete('borders');
    }
    propKeys.forEach((propKey) => {
      log.warn(`Unknown node property ${propKey}`);
    });
  }

  updateNodeBounds(node, rect);

  node.intersect = function (point) {

    log.warn("kkknnnn")
    return intersect.rect(node, point);
  };

  return shapeSvg;

};


const task = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(
    parent,
    node,
    'node ' + node.classes,
    true
  );

  // add the rect
  const rect = shapeSvg.insert('rect', ':first-child');

  // const totalWidth = bbox.width + node.padding * 2;
  // const totalHeight = bbox.height + node.padding * 2;
  const totalWidth = bbox.width + node.padding ;
  const totalHeight = bbox.height + node.padding ;
  rect
    .attr('class', 'basic label-container')
    .attr('style', node.style)
    .attr('rx', node.rx)
    .attr('ry', node.ry)
    .attr('x', -bbox.width / 2 - halfPadding)
    .attr('y', -bbox.height / 2 - halfPadding)
    // .attr('x', -bbox.width / 2 - halfPadding - 30)
    // .attr('y', -bbox.height / 2 - halfPadding - 30)
    // .attr('width', 4/3 * totalWidth)
    // .attr('height', totalHeight + (totalWidth / 3));
    .attr('width', totalWidth)
    .attr('height', totalHeight);

  let taskImg = pngDict[node.taskType]

  log.warn("halph chie?", halfPadding, bbox.width, node.labelText)
  var personWidth = 30
  var personHeight = 30

  let taskTypeX = -bbox.width / 2 - personWidth - (halfPadding/4)
  let taskTypeY = -bbox.height / 2 - personHeight - (halfPadding/4)

  if (node.taskType == 'sub-process-marker') {
    taskTypeX = -personWidth/2
    taskTypeY = bbox.height / 2

  }
  const personElem = drawImage(
    shapeSvg,
    personWidth,
    personHeight,
    taskTypeX,
    taskTypeY,
    taskImg
  );

  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect, node.props.borders, totalWidth, totalHeight);
      // propKeys.delete('borders');
    }
    propKeys.forEach((propKey) => {
      log.warn(`Unknown node property ${propKey}`);
    });
  }

  updateNodeBounds(node, rect);

  node.intersect = function (point) {

    log.warn("kkknnnn")
    return intersect.rect(node, point);
  };

  return shapeSvg;

};


const x_question = async (parent, node) => {

  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const s = w + h;

  const points = [
    // shargh -> shomal -> gharb -> junub -> junub sharghi -> shomal_gharbi -> shomal -> shomal-sharghi -> junub-gharbi

    { x: s, y: -s / 2 }, //rast
    { x: s / 2, y: 0 },  // paeen
    { x: 0, y: -s / 2 }, // chap
    { x: s / 2, y: -s }, // bala
    { x: 3 * s / 4, y: - 3 * s / 4 },
    { x: s/4, y: -s / 4 },
    { x: s / 2, y: 0 },
    { x: 3 * s / 4, y: -s / 4 },
    { x: s / 4, y: -3 * s / 4 },
    { x: s / 2, y: -s },
    { x: s, y: -s / 2 },
    { x: s / 2, y: 0 },
    { x: 0, y: -s / 2 },
    { x: s / 2, y: -s }

  ];

  log.info('XQuestion main (Circle)');

  const xQuestionElem = insertXPolygonShape(shapeSvg, s, s, points);
  xQuestionElem.attr('style', node.style);
  updateNodeBounds(node, xQuestionElem);

  node.intersect = function (point) {
    log.warn('Intersect called');
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};

export const drawImage = function (elem, width, height, x, y, link) {
  const imageElem = elem.append('image');
  imageElem.attr('width', width);
  imageElem.attr('height', height);
  imageElem.attr('x', x);
  imageElem.attr('y', y);
  let sanitizedLink = link.startsWith('data:image/png;base64') ? link : sanitizeUrl(link);
  imageElem.attr('xlink:href', sanitizedLink);

  return imageElem
};

const choice = (parent, node) => {
  const shapeSvg = parent
    .insert('g')
    .attr('class', 'node default')
    .attr('id', node.domId || node.id);

  const s = 28;
  const points = [
    { x: 0, y: s / 2 },
    { x: s / 2, y: 0 },
    { x: 0, y: -s / 2 },
    { x: -s / 2, y: 0 },
  ];

  const choice = shapeSvg.insert('polygon', ':first-child').attr(
    'points',
    points
      .map(function (d) {
        return d.x + ',' + d.y;
      })
      .join(' ')
  );
  // center the circle around its coordinate
  choice.attr('class', 'state-start').attr('r', 7).attr('width', 28).attr('height', 28);
  node.width = 28;
  node.height = 28;

  node.intersect = function (point) {
    return intersect.circle(node, 14, point);
  };

  return shapeSvg;
};

const hexagon = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const f = 4;
  const h = bbox.height + node.padding;
  const m = h / f;
  const w = bbox.width + 2 * m + node.padding;
  const points = [
    { x: m, y: 0 },
    { x: w - m, y: 0 },
    { x: w, y: -h / 2 },
    { x: w - m, y: -h },
    { x: m, y: -h },
    { x: 0, y: -h / 2 },
  ];

  const hex = insertPolygonShape(shapeSvg, w, h, points);
  hex.attr('style', node.style);
  updateNodeBounds(node, hex);

  node.intersect = function (point) {
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};

const rect_left_inv_arrow = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  log.warn("recte line la", node)
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: -h / 2, y: 0 },
    { x: w, y: 0 },
    { x: w, y: -h },
    { x: -h / 2, y: -h },
    { x: 0, y: -h / 2 },
  ];

  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr('style', node.style);

  node.width = w + h;
  node.height = h;

  node.intersect = function (point) {
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};

const lean_right = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: (-2 * h) / 6, y: 0 },
    { x: w - h / 6, y: 0 },
    { x: w + (2 * h) / 6, y: -h },
    { x: h / 6, y: -h },
  ];

  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr('style', node.style);
  updateNodeBounds(node, el);

  node.intersect = function (point) {
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};

const lean_left = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: (2 * h) / 6, y: 0 },
    { x: w + h / 6, y: 0 },
    { x: w - (2 * h) / 6, y: -h },
    { x: -h / 6, y: -h },
  ];

  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr('style', node.style);
  updateNodeBounds(node, el);

  node.intersect = function (point) {
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};

const trapezoid = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: (-2 * h) / 6, y: 0 },
    { x: w + (2 * h) / 6, y: 0 },
    { x: w - h / 6, y: -h },
    { x: h / 6, y: -h },
  ];

  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr('style', node.style);
  updateNodeBounds(node, el);

  node.intersect = function (point) {
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};

const inv_trapezoid = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: h / 6, y: 0 },
    { x: w - h / 6, y: 0 },
    { x: w + (2 * h) / 6, y: -h },
    { x: (-2 * h) / 6, y: -h },
  ];

  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr('style', node.style);
  updateNodeBounds(node, el);

  node.intersect = function (point) {
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};

const rect_right_inv_arrow = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  log.warn("recte line inv", node)
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: 0, y: 0 },
    { x: w + h / 2, y: 0 },
    { x: w, y: -h / 2 },
    { x: w + h / 2, y: -h },
    { x: 0, y: -h },
  ];

  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr('style', node.style);
  updateNodeBounds(node, el);

  node.intersect = function (point) {
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};

const cylinder = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const w = bbox.width + node.padding;
  const rx = w / 2;
  const ry = rx / (2.5 + w / 50);
  const h = bbox.height + ry + node.padding;

  const shape =
    'M 0,' +
    ry +
    ' a ' +
    rx +
    ',' +
    ry +
    ' 0,0,0 ' +
    w +
    ' 0 a ' +
    rx +
    ',' +
    ry +
    ' 0,0,0 ' +
    -w +
    ' 0 l 0,' +
    h +
    ' a ' +
    rx +
    ',' +
    ry +
    ' 0,0,0 ' +
    w +
    ' 0 l 0,' +
    -h;

  const el = shapeSvg
    .attr('label-offset-y', ry)
    .insert('path', ':first-child')
    .attr('style', node.style)
    .attr('d', shape)
    .attr('transform', 'translate(' + -w / 2 + ',' + -(h / 2 + ry) + ')');

  updateNodeBounds(node, el);

  node.intersect = function (point) {
    const pos = intersect.rect(node, point);
    const x = pos.x - node.x;

    if (
      rx != 0 &&
      (Math.abs(x) < node.width / 2 ||
        (Math.abs(x) == node.width / 2 && Math.abs(pos.y - node.y) > node.height / 2 - ry))
    ) {
      // ellipsis equation: x*x / a*a + y*y / b*b = 1
      // solve for y to get adjusted value for pos.y
      let y = ry * ry * (1 - (x * x) / (rx * rx));
      if (y != 0) {
        y = Math.sqrt(y);
      }
      y = ry - y;
      if (point.y - node.y > 0) {
        y = -y;
      }

      pos.y += y;
    }

    return pos;
  };

  return shapeSvg;
};

const rect = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(
    parent,
    node,
    'node ' + node.classes,
    true
  );
  // add the rect
  log.warn("recte line", node)
  const rect = shapeSvg.insert('rect', ':first-child');

  // const totalWidth = bbox.width + node.padding * 2;
  // const totalHeight = bbox.height + node.padding * 2;
  const totalWidth = bbox.width + node.padding;
  const totalHeight = bbox.height + node.padding;
  rect
    .attr('class', 'basic label-container')
    .attr('style', node.style)
    .attr('rx', node.rx)
    .attr('ry', node.ry)
    // .attr('x', -bbox.width / 2 - node.padding)
    // .attr('y', -bbox.height / 2 - node.padding)
    .attr('x', -bbox.width / 2 - halfPadding)
    .attr('y', -bbox.height / 2 - halfPadding)
    .attr('width', totalWidth)
    .attr('height', totalHeight);

  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect, node.props.borders, totalWidth, totalHeight);
      propKeys.delete('borders');
    }
    propKeys.forEach((propKey) => {
      log.warn(`Unknown node property ${propKey}`);
    });
  }

  updateNodeBounds(node, rect);

  node.intersect = function (point) {
    return intersect.rect(node, point);
  };

  return shapeSvg;
};


const simpleMessage = async (parent, node) => {

  var messageWidth = 53.2
  var messageHeight = 36

  node.shapeWidth = messageWidth
  node.shapeHeight = messageHeight

  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, undefined, true);

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;

  log.warn("label posirrrr", node.height, bbox.height, bbox.width)

  let messageImg =
    'data:image/png;base64,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D5I2G+PcCALIWwCi0bsu33XLoOnyrtEy/tsQ4Htc52Xd5StUN7PmuRIEUIIARMMTL/5kgajnYuJwef9nCPBDnKNzfpQHoDYn2pkggHIEIPpZYtH3C0TdRYk/k/0fhgA/QT390H+2itw6NF1NEEBpAhB5byzp6uvrKtnorYR/CwHuEgSm5tbU5E5VEwRQpgBELs8/76KQvwoB7oogEARQsgDKAQJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAEBiAsSiwORGrDkCXHnWPwDICv9nr5ghQNOZnINAVuScaTJDAKAYIAAEABAAQAAAAQAEABAAQAAAAQAEABAAQAAAAQAEABAAQAAAAQAEABAAyEeARqBoKBYomn8DyvHt+QhUJoMAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjEtMDItMTNUMDM6NTY6MTErMDA6MDBqMMCTAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIxLTAyLTEzVDAzOjU2OjExKzAwOjAwG214LwAAAABJRU5ErkJggg==';
  const xQuestionElem = drawImage(
    shapeSvg,
    messageWidth,
    messageHeight,
    -messageWidth / 2,
    -messageHeight / 2,
    messageImg
  );
  // const dtext = shapeSvg
  //   .append('div')
  //   .attr(sty)
  //   .attr('x', 0)
  //   .attr('y', 35)
  //   .attr('class', 'commit-label')
  //
  //   .text("node.labelSimpleTextxxxxa sdasd xxx  xxxxxxx x asfdasc");

  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(shapeSvg, node.props.borders, messageWidth, messageWidth)
      propKeys.delete('borders');
    }
    propKeys.forEach((propKey) => {
      log.warn(`Unknown node property ${propKey}`);
    });
  }


  log.info('XQuestion main (Circle)');
  //
  xQuestionElem.attr('style',   node.style);
  updateNodeBounds(node, shapeSvg);

  node.intersect = function (point) {

    log.warn("asdasdk")
    log.warn('Mew Simple Message intersect', node, "__q12__", point, bbox.width, "XX" ,bbox.height);

    return intersect.costumeRect(node, 0, bbox.height/2, 0, point);
  };

  log.warn("nkasdasd", node.intersect)
  // node.intersect = function (point) {
  //   return intersect.rect(node, point);
  // };

  return shapeSvg;
  // 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D5I2G+PcCALIWwCi0bsu33XLoOnyrtEy/tsQ4Htc52Xd5StUN7PmuRIEUIIARMMTL/5kgajnYuJwef9nCPBDnKNzfpQHoDYn2pkggHIEIPpZYtH3C0TdRYk/k/0fhgA/QT390H+2itw6NF1NEEBpAhB5byzp6uvrKtnorYR/CwHuEgSm5tbU5E5VEwRQpgBELs8/76KQvwoB7oogEARQsgDKAQJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABAAQAEABAAAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAEBiAsSiwORGrDkCXHnWPwDICv9nr5ghQNOZnINAVuScaTJDAKAYIAAEABAAQAAAAQAEABAAQAAAAQAEABAAQAAAAQAEABAAQAAAAQAEABAAyEeARqBoKBYomn8DyvHt+QhUJoMAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjEtMDItMTNUMDM6NTY6MTErMDA6MDBqMMCTAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIxLTAyLTEzVDAzOjU2OjExKzAwOjAwG214LwAAAABJRU5ErkJggg==
  // const { shapeSvg, bbox, halfPadding } = await labelHelper(
  //   parent,
  //   node,
  //   'node ' + node.classes,
  //   true
  // );

  // add the rect
  // add the rect
  // const rect = shapeSvg.insert('svg', ':first-child');
  // const rect = shapeSvg.insert('rect', ':first-child');

  // const totalWidth = bbox.width + node.padding * 2;
  // const totalHeight = bbox.height + node.padding * 2;
  // const totalWidth = bbox.width + node.padding;
  // const totalHeight = bbox.height + node.padding;

  //
  // rect
  //   .attr('x', -bbox.width / 2 - halfPadding)
  //   .attr('y', -bbox.height / 2 - halfPadding)
  //   .attr('fill',"currentColor")
  //   .insert('path', ':first-child')
  //   .attr(
  //     'd',
  //     'M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z'
  //   )

  // if (node.props) {
  //   const propKeys = new Set(Object.keys(node.props));
  //   if (node.props.borders) {
  //     applyNodePropertyBorders(rect, node.props.borders, totalWidth, totalHeight);
  //     propKeys.delete('borders');
  //   }
  //   propKeys.forEach((propKey) => {
  //     log.warn(`Unknown node property ${propKey}`);
  //   });
  // }
  //
  // updateNodeBounds(node, rect);
  //
  //
  // const text = shapeSvg
  //   .append('text')
  //   .attr('x', 0)
  //   .attr('y', bbox.height + node.padding)
  //   .attr('class', 'circle-label')
  //   .text(node.labelText);
  //
  //
  // node.intersect = function (point) {
  //   return intersect.rect(node, point);
  // };
  //
  // return shapeSvg;


};




const labelRect = async (parent, node) => {
  const { shapeSvg } = await labelHelper(parent, node, 'label', true);

  log.trace('Classes = ', node.classes);
  // add the rect
  const rect = shapeSvg.insert('rect', ':first-child');

  log.warn("recte line label Rect", node)
  // Hide the rect we are only after the label
  const totalWidth = 0;
  const totalHeight = 0;
  rect.attr('width', totalWidth).attr('height', totalHeight);
  shapeSvg.attr('class', 'label edgeLabel');

  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect, node.props.borders, totalWidth, totalHeight);
      propKeys.delete('borders');
    }
    propKeys.forEach((propKey) => {
      log.warn(`Unknown node property ${propKey}`);
    });
  }

  updateNodeBounds(node, rect);

  node.intersect = function (point) {
    return intersect.rect(node, point);
  };

  return shapeSvg;
};

/**
 * @param rect
 * @param borders
 * @param totalWidth
 * @param totalHeight
 */
function applyNodePropertyBorders(rect, borders, totalWidth, totalHeight) {
  const strokeDashArray = [];
  const addBorder = (length) => {
    strokeDashArray.push(length, 0);
  };
  const skipBorder = (length) => {
    strokeDashArray.push(0, length);
  };
  if (borders.includes('t')) {
    log.debug('add top border');
    addBorder(totalWidth);
  } else {
    skipBorder(totalWidth);
  }
  if (borders.includes('r')) {
    log.debug('add right border');
    addBorder(totalHeight);
  } else {
    skipBorder(totalHeight);
  }
  if (borders.includes('b')) {
    log.debug('add bottom border');
    addBorder(totalWidth);
  } else {
    skipBorder(totalWidth);
  }
  if (borders.includes('l')) {
    log.debug('add left border');
    addBorder(totalHeight);
  } else {
    skipBorder(totalHeight);
  }
  rect.attr('stroke-dasharray', strokeDashArray.join(' '));
}

const rectWithTitle = (parent, node) => {
  // const { shapeSvg, bbox, halfPadding } = labelHelper(parent, node, 'node ' + node.classes);

  log.warn("recte line rwt", node)
  let classes;
  if (!node.classes) {
    classes = 'node default';
  } else {
    classes = 'node ' + node.classes;
  }
  // Add outer g element
  const shapeSvg = parent
    .insert('g')
    .attr('class', classes)
    .attr('id', node.domId || node.id);

  // Create the title label and insert it after the rect
  const rect = shapeSvg.insert('rect', ':first-child');
  // const innerRect = shapeSvg.insert('rect');
  const innerLine = shapeSvg.insert('line');

  const label = shapeSvg.insert('g').attr('class', 'label');

  const text2 = node.labelText.flat ? node.labelText.flat() : node.labelText;
  // const text2 = typeof text2prim === 'object' ? text2prim[0] : text2prim;

  let title = '';
  if (typeof text2 === 'object') {
    title = text2[0];
  } else {
    title = text2;
  }
  log.info('Label text abc79', title, text2, typeof text2 === 'object');

  const text = label.node().appendChild(createLabel(title, node.labelStyle, true, true));
  let bbox = { width: 0, height: 0 };
  if (evaluate(getConfig().flowchart.htmlLabels)) {
    const div = text.children[0];
    const dv = select(text);
    bbox = div.getBoundingClientRect();
    dv.attr('width', bbox.width);
    dv.attr('height', bbox.height);
  }
  log.info('Text 2', text2);
  const textRows = text2.slice(1, text2.length);
  let titleBox = text.getBBox();
  const descr = label
    .node()
    .appendChild(
      createLabel(textRows.join ? textRows.join('<br/>') : textRows, node.labelStyle, true, true)
    );

  if (evaluate(getConfig().flowchart.htmlLabels)) {
    const div = descr.children[0];
    const dv = select(descr);
    bbox = div.getBoundingClientRect();
    dv.attr('width', bbox.width);
    dv.attr('height', bbox.height);
  }
  // bbox = label.getBBox();
  // log.info(descr);
  const halfPadding = node.padding / 2;
  select(descr).attr(
    'transform',
    'translate( ' +
      // (titleBox.width - bbox.width) / 2 +
      (bbox.width > titleBox.width ? 0 : (titleBox.width - bbox.width) / 2) +
      ', ' +
      (titleBox.height + halfPadding + 5) +
      ')'
  );
  select(text).attr(
    'transform',
    'translate( ' +
      // (titleBox.width - bbox.width) / 2 +
      (bbox.width < titleBox.width ? 0 : -(titleBox.width - bbox.width) / 2) +
      ', ' +
      0 +
      ')'
  );
  // Get the size of the label

  // Bounding box for title and text
  bbox = label.node().getBBox();

  // Center the label
  label.attr(
    'transform',
    'translate(' + -bbox.width / 2 + ', ' + (-bbox.height / 2 - halfPadding + 3) + ')'
  );

  rect
    .attr('class', 'outer title-state')
    .attr('x', -bbox.width / 2 - halfPadding)
    .attr('y', -bbox.height / 2 - halfPadding)
    .attr('width', bbox.width + node.padding)
    .attr('height', bbox.height + node.padding);

  innerLine
    .attr('class', 'divider')
    .attr('x1', -bbox.width / 2 - halfPadding)
    .attr('x2', bbox.width / 2 + halfPadding)
    .attr('y1', -bbox.height / 2 - halfPadding + titleBox.height + halfPadding)
    .attr('y2', -bbox.height / 2 - halfPadding + titleBox.height + halfPadding);

  updateNodeBounds(node, rect);

  node.intersect = function (point) {
    return intersect.rect(node, point);
  };

  return shapeSvg;
};

const stadium = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const h = bbox.height + node.padding;
  const w = bbox.width + h / 4 + node.padding;

  // add the rect
  const rect = shapeSvg
    .insert('rect', ':first-child')
    .attr('style', node.style)
    .attr('rx', h / 2)
    .attr('ry', h / 2)
    .attr('x', -w / 2)
    .attr('y', -h / 2)
    .attr('width', w)
    .attr('height', h);

  updateNodeBounds(node, rect);

  node.intersect = function (point) {
    return intersect.rect(node, point);
  };

  return shapeSvg;
};

const circle = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, undefined, true);
  const circle = shapeSvg.insert('circle', ':first-child');

  // center the circle around its coordinate
  circle
    .attr('style', node.style)
    .attr('rx', node.rx)
    .attr('ry', node.ry)
    .attr('r', bbox.width / 2 + halfPadding)
    .attr('width', bbox.width + node.padding)
    .attr('height', bbox.height + node.padding);

  log.info('Circle main');

  updateNodeBounds(node, circle);

  node.intersect = function (point) {
    log.info('Circle intersect', node, bbox.width / 2 + halfPadding, point);
    return intersect.circle(node, bbox.width / 2 + halfPadding, point);
  };

  return shapeSvg;
};

const endcircle = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, undefined, true);
  const circle = shapeSvg.insert('circle', ':first-child');

  // center the circle around its coordinate
  circle
    .attr('style', node.style)
    .attr('rx', node.rx)
    .attr('ry', node.ry)
    .attr('r', bbox.width / 2 + halfPadding)
    .attr('style', 'stroke-width:2px!important;')
    .attr('width', bbox.width + node.padding)
    .attr('height', bbox.height + node.padding);


  log.info('Circle main');

  updateNodeBounds(node, circle);

  node.intersect = function (point) {
    log.info('Circle intersect', node, bbox.width / 2 + halfPadding, point);
    return intersect.circle(node, bbox.width / 2 + halfPadding, point);
  };

  const text = shapeSvg
    .append('text')
    .attr('x', 0)
    .attr('y', bbox.height + node.padding)
    .attr('class', 'circle-label')
    .text(node.labelText);


  return shapeSvg;
};


const terminatecircle = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, undefined, true);
  const gap = 5;
  const circleGroup = shapeSvg.append('g');

  const outerCircle = circleGroup
    .append('circle')
    .attr('style', node.style)
    .attr('cx',  node.rx)
    .attr('cy',  node.ry)
    // .attr('class', 'face')
    .attr('r', bbox.width / 2 + halfPadding + gap)

    .attr('style', 'stroke-width:2px!important;')
    // .attr('stroke-width', 2)
    .attr('overflow', 'visible');


  const innerCircle = circleGroup.append('g');
  //left eye
  innerCircle
    .append('circle')
    .attr('style', node.style)
    .attr('cx',  node.rx)
    .attr('cy',  node.ry)
    .attr('style', 'fill:black!important;')
    .attr('r', bbox.width / 2.5 + halfPadding)
    .attr('stroke-width', 2)
    .attr('stroke', 'black');

  log.info('DoubleCircle main');

  const text = shapeSvg
    .append('text')
    .attr('x', 0)
    .attr('y', bbox.width / 2.5 + halfPadding * 3.5)
    .attr('class', 'commit-label')
    .text(node.labelText);

  updateNodeBounds(node, outerCircle);

  node.intersect = function (point) {
    log.info('DoubleCircle intersect', node, bbox.width / 2 + halfPadding + gap, point);
    return intersect.circle(node, bbox.width / 2 + halfPadding + gap, point);
  };

  return shapeSvg;
};

const doublecircle = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, undefined, true);
  const gap = 5;
  const circleGroup = shapeSvg.insert('g', ':first-child');
  const outerCircle = circleGroup.insert('circle');
  const innerCircle = circleGroup.insert('circle');

  // center the circle around its coordinate
  outerCircle
    .attr('style', node.style)
    .attr('rx', node.rx)
    .attr('ry', node.ry)
    .attr('r', bbox.width / 2 + halfPadding + gap)
    .attr('width', bbox.width + node.padding + gap * 2)
    .attr('height', bbox.height + node.padding + gap * 2);

  innerCircle
    .attr('style', node.style)
    .attr('rx', node.rx)
    .attr('ry', node.ry)
    .attr('r', bbox.width / 2 + halfPadding)
    .attr('width', bbox.width + node.padding)
    .attr('height', bbox.height + node.padding);

  log.info('DoubleCircle main');

  const text = shapeSvg
    .append('text')
    .attr('x', 0)
    .attr('y', bbox.height + node.padding)
    .attr('class', 'commit-label')
    .text(node.labelText);

  updateNodeBounds(node, outerCircle);

  node.intersect = function (point) {
    log.info('DoubleCircle intersect', node, bbox.width / 2 + halfPadding + gap, point);
    return intersect.circle(node, bbox.width / 2 + halfPadding + gap, point);
  };

  return shapeSvg;

};

const subroutine = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);

  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: -h },
    { x: 0, y: -h },
    { x: 0, y: 0 },
    { x: -8, y: 0 },
    { x: w + 8, y: 0 },
    { x: w + 8, y: -h },
    { x: -8, y: -h },
    { x: -8, y: 0 },
  ];

  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr('style', node.style);
  updateNodeBounds(node, el);

  node.intersect = function (point) {
    return intersect.polygon(node, points, point);
  };

  return shapeSvg;
};

const start = (parent, node) => {
  const shapeSvg = parent
    .insert('g')
    .attr('class', 'node default')
    .attr('id', node.domId || node.id);
  const circle = shapeSvg.insert('circle', ':first-child');

  // center the circle around its coordinate
  circle.attr('class', 'state-start').attr('r', 7).attr('width', 14).attr('height', 14);

  updateNodeBounds(node, circle);

  node.intersect = function (point) {
    return intersect.circle(node, 7, point);
  };

  return shapeSvg;
};

const forkJoin = (parent, node, dir) => {
  const shapeSvg = parent
    .insert('g')
    .attr('class', 'node default')
    .attr('id', node.domId || node.id);

  let width = 70;
  let height = 10;

  if (dir === 'LR') {
    width = 10;
    height = 70;
  }

  const shape = shapeSvg
    .append('rect')
    .attr('x', (-1 * width) / 2)
    .attr('y', (-1 * height) / 2)
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'fork-join');

  updateNodeBounds(node, shape);
  node.height = node.height + node.padding / 2;
  node.width = node.width + node.padding / 2;
  node.intersect = function (point) {
    return intersect.rect(node, point);
  };

  return shapeSvg;
};

const end = (parent, node) => {
  const shapeSvg = parent
    .insert('g')
    .attr('class', 'node default')
    .attr('id', node.domId || node.id);
  const innerCircle = shapeSvg.insert('circle', ':first-child');
  const circle = shapeSvg.insert('circle', ':first-child');

  circle.attr('class', 'state-start').attr('r', 7).attr('width', 14).attr('height', 14);

  innerCircle.attr('class', 'state-end').attr('r', 5).attr('width', 10).attr('height', 10);

  updateNodeBounds(node, circle);

  node.intersect = function (point) {
    return intersect.circle(node, 7, point);
  };

  return shapeSvg;
};

const class_box = (parent, node) => {
  const halfPadding = node.padding / 2;
  const rowPadding = 4;
  const lineHeight = 8;

  let classes;
  if (!node.classes) {
    classes = 'node default';
  } else {
    classes = 'node ' + node.classes;
  }
  // Add outer g element
  const shapeSvg = parent
    .insert('g')
    .attr('class', classes)
    .attr('id', node.domId || node.id);

  // Create the title label and insert it after the rect
  const rect = shapeSvg.insert('rect', ':first-child');
  const topLine = shapeSvg.insert('line');
  const bottomLine = shapeSvg.insert('line');
  let maxWidth = 0;
  let maxHeight = rowPadding;

  const labelContainer = shapeSvg.insert('g').attr('class', 'label');
  let verticalPos = 0;
  const hasInterface = node.classData.annotations && node.classData.annotations[0];

  // 1. Create the labels
  const interfaceLabelText = node.classData.annotations[0]
    ? '«' + node.classData.annotations[0] + '»'
    : '';
  const interfaceLabel = labelContainer
    .node()
    .appendChild(createLabel(interfaceLabelText, node.labelStyle, true, true));
  let interfaceBBox = interfaceLabel.getBBox();
  if (evaluate(getConfig().flowchart.htmlLabels)) {
    const div = interfaceLabel.children[0];
    const dv = select(interfaceLabel);
    interfaceBBox = div.getBoundingClientRect();
    dv.attr('width', interfaceBBox.width);
    dv.attr('height', interfaceBBox.height);
  }
  if (node.classData.annotations[0]) {
    maxHeight += interfaceBBox.height + rowPadding;
    maxWidth += interfaceBBox.width;
  }

  let classTitleString = node.classData.label;

  if (node.classData.type !== undefined && node.classData.type !== '') {
    if (getConfig().flowchart.htmlLabels) {
      classTitleString += '&lt;' + node.classData.type + '&gt;';
    } else {
      classTitleString += '<' + node.classData.type + '>';
    }
  }
  const classTitleLabel = labelContainer
    .node()
    .appendChild(createLabel(classTitleString, node.labelStyle, true, true));
  select(classTitleLabel).attr('class', 'classTitle');
  let classTitleBBox = classTitleLabel.getBBox();
  if (evaluate(getConfig().flowchart.htmlLabels)) {
    const div = classTitleLabel.children[0];
    const dv = select(classTitleLabel);
    classTitleBBox = div.getBoundingClientRect();
    dv.attr('width', classTitleBBox.width);
    dv.attr('height', classTitleBBox.height);
  }
  maxHeight += classTitleBBox.height + rowPadding;
  if (classTitleBBox.width > maxWidth) {
    maxWidth = classTitleBBox.width;
  }
  const classAttributes = [];
  node.classData.members.forEach((str) => {
    const parsedInfo = parseMember(str);
    let parsedText = parsedInfo.displayText;
    if (getConfig().flowchart.htmlLabels) {
      parsedText = parsedText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    const lbl = labelContainer
      .node()
      .appendChild(
        createLabel(
          parsedText,
          parsedInfo.cssStyle ? parsedInfo.cssStyle : node.labelStyle,
          true,
          true
        )
      );
    let bbox = lbl.getBBox();
    if (evaluate(getConfig().flowchart.htmlLabels)) {
      const div = lbl.children[0];
      const dv = select(lbl);
      bbox = div.getBoundingClientRect();
      dv.attr('width', bbox.width);
      dv.attr('height', bbox.height);
    }
    if (bbox.width > maxWidth) {
      maxWidth = bbox.width;
    }
    maxHeight += bbox.height + rowPadding;
    classAttributes.push(lbl);
  });

  maxHeight += lineHeight;

  const classMethods = [];
  node.classData.methods.forEach((str) => {
    const parsedInfo = parseMember(str);
    let displayText = parsedInfo.displayText;
    if (getConfig().flowchart.htmlLabels) {
      displayText = displayText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    const lbl = labelContainer
      .node()
      .appendChild(
        createLabel(
          displayText,
          parsedInfo.cssStyle ? parsedInfo.cssStyle : node.labelStyle,
          true,
          true
        )
      );
    let bbox = lbl.getBBox();
    if (evaluate(getConfig().flowchart.htmlLabels)) {
      const div = lbl.children[0];
      const dv = select(lbl);
      bbox = div.getBoundingClientRect();
      dv.attr('width', bbox.width);
      dv.attr('height', bbox.height);
    }
    if (bbox.width > maxWidth) {
      maxWidth = bbox.width;
    }
    maxHeight += bbox.height + rowPadding;

    classMethods.push(lbl);
  });

  maxHeight += lineHeight;

  // 2. Position the labels

  // position the interface label
  if (hasInterface) {
    let diffX = (maxWidth - interfaceBBox.width) / 2;
    select(interfaceLabel).attr(
      'transform',
      'translate( ' + ((-1 * maxWidth) / 2 + diffX) + ', ' + (-1 * maxHeight) / 2 + ')'
    );
    verticalPos = interfaceBBox.height + rowPadding;
  }
  // Position the class title label
  let diffX = (maxWidth - classTitleBBox.width) / 2;
  select(classTitleLabel).attr(
    'transform',
    'translate( ' +
      ((-1 * maxWidth) / 2 + diffX) +
      ', ' +
      ((-1 * maxHeight) / 2 + verticalPos) +
      ')'
  );
  verticalPos += classTitleBBox.height + rowPadding;

  topLine
    .attr('class', 'divider')
    .attr('x1', -maxWidth / 2 - halfPadding)
    .attr('x2', maxWidth / 2 + halfPadding)
    .attr('y1', -maxHeight / 2 - halfPadding + lineHeight + verticalPos)
    .attr('y2', -maxHeight / 2 - halfPadding + lineHeight + verticalPos);

  verticalPos += lineHeight;

  classAttributes.forEach((lbl) => {
    select(lbl).attr(
      'transform',
      'translate( ' +
        -maxWidth / 2 +
        ', ' +
        ((-1 * maxHeight) / 2 + verticalPos + lineHeight / 2) +
        ')'
    );
    verticalPos += classTitleBBox.height + rowPadding;
  });

  verticalPos += lineHeight;
  bottomLine
    .attr('class', 'divider')
    .attr('x1', -maxWidth / 2 - halfPadding)
    .attr('x2', maxWidth / 2 + halfPadding)
    .attr('y1', -maxHeight / 2 - halfPadding + lineHeight + verticalPos)
    .attr('y2', -maxHeight / 2 - halfPadding + lineHeight + verticalPos);

  verticalPos += lineHeight;

  classMethods.forEach((lbl) => {
    select(lbl).attr(
      'transform',
      'translate( ' + -maxWidth / 2 + ', ' + ((-1 * maxHeight) / 2 + verticalPos) + ')'
    );
    verticalPos += classTitleBBox.height + rowPadding;
  });

  rect
    .attr('class', 'outer title-state')
    .attr('x', -maxWidth / 2 - halfPadding)
    .attr('y', -(maxHeight / 2) - halfPadding)
    .attr('width', maxWidth + node.padding)
    .attr('height', maxHeight + node.padding);

  updateNodeBounds(node, rect);

  node.intersect = function (point) {
    return intersect.rect(node, point);
  };

  return shapeSvg;
};

const shapes = {
  rhombus: question,
  question,
  x_question,
  person,
  personTask,
  extraShape,
  task,
  simpleMessage,
  rect,
  labelRect,
  rectWithTitle,
  choice,
  circle,
  terminatecircle,
  endcircle,
  doublecircle,
  stadium,
  hexagon,
  rect_left_inv_arrow,
  lean_right,
  lean_left,
  trapezoid,
  inv_trapezoid,
  rect_right_inv_arrow,
  cylinder,
  start,
  end,
  note,
  subroutine,
  fork: forkJoin,
  join: forkJoin,
  class_box,
};

export let nodeElems = {};

export const insertNode = async (elem, node, dir) => {
  let newEl;
  let el;

  log.warn("position insert node inja", node.id, elem, node);
  // Add link when appropriate
  if (node.link) {
    let target;
    if (getConfig().securityLevel === 'sandbox') {
      target = '_top';
    } else if (node.linkTarget) {
      target = node.linkTarget || '_blank';
    }
    newEl = elem.insert('svg:a').attr('xlink:href', node.link).attr('target', target);
    if (!shapes.hasOwnProperty(node.shape)) {
      console.log("there is some problem!!!", node.shape)
    }
    el = await shapes[node.shape](newEl, node, dir);
  } else {
    if (!shapes.hasOwnProperty(node.shape)) {
      console.log("damn!!!", node, node.shape, shapes)
    }
    el = await shapes[node.shape](elem, node, dir);
    newEl = el;
  }
  if (node.tooltip) {
    el.attr('title', node.tooltip);
  }
  if (node.class) {
    el.attr('class', 'node default ' + node.class);
  }

  nodeElems[node.id] = newEl;

  if (node.haveCallback) {
    nodeElems[node.id].attr('class', nodeElems[node.id].attr('class') + ' clickable');
  }
  return newEl;
};
export const setNodeElem = (elem, node) => {
  if (nodeElems[node.id]) {
    log.warn("elem already exist", node)
  }
  nodeElems[node.id] = elem;
};
export const clear = () => {
  nodeElems = {};
};



export const positionNode = (node) => {
  const el = nodeElems[node.id];

  const padding = 8;
  const diff = node.diff || 0;

  log.warn("position node inja", node, el, JSON.stringify(el));
  log.trace(
    'Transforming node',
    node.diff,
    node,
    'translate(' + (node.x - node.width / 2) + ', ' + node.width / 2 + ')'
  );

  let y = (node.y - node.height / 2 - padding)
  let x = 0
  if (node.clusterNode) {

    if (node.clusterData && node.clusterData.type =='subpool') {
      log.warn("mimimHHHNODE", node.id, JSON.stringify(poolHeightCosumer[subPoolPar[node.id]]), subPoolPar[node.id], node)
      if (!poolHeightCosumer[subPoolPar[node.id]]) {
        poolHeightCosumer[subPoolPar[node.id]] = 0
        log.warn("mimimiss", "as", node, "____", subPoolPar[node.id], JSON.stringify(node.height), JSON.stringify(poolHeightCosumer[subPoolPar[node.id]]))

      }
      x = labelWidthController[node.id]
      // x= 100
      // const text =
      //   node.labelType === 'markdown'
      //     ? createText(label, node.labelText, { style: node.labelStyle, useHtmlLabels })
      //     : label.node().appendChild(createLabel(node.labelText, node.labelStyle, undefined, true));
      // let textBox = text.getBBox()
      y = poolHeightCosumer[subPoolPar[node.id]]
      lineHeightPos[node.id] = y
      poolHeightCosumer[subPoolPar[node.id]] += node.height

    } else {
      log.warn("hight mimi", node.height, "as", node)
      y = (node.y - node.height / 2 - padding)
      // x = (node.x + diff - node.width / 2)
      x = 0

    }

    log.warn("mimimi translate nod2ws", node.id, node.labelWidth, x, node.x, node.width / 2, "y:", y, node)
    el.attr(
      'transform',
      'translate(' +
        // node.x + "," +
        x + ', ' +
        y +
        ')'
    );

  } else {
    log.warn("mewmewmew", node.height, "as", node)

    el.attr('transform', 'translate(' + node.x + ', ' + node.y + ')');
  }

  return diff;
};

export const fixPoolHeightAndWidth = (id, flag) => {
  log.warn("fixheighttttt", flag, poolHeightCosumer, "as", id, poolHeightCosumer[id]);
  //
  // log.warn("afterfixheight", poolHeightCosumer, "as", id, poolHeightCosumer[id], poolHeightCosumer.length);
  // var h = poolHeightCosumer[id]
  var h = 100
  return h
}
