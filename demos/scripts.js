// Import your pngDict here
import { pngDict } from './bpmn_icons.js'; // Update the path to your pngDict file

document.addEventListener("DOMContentLoaded", function () {
  const bpmnShapes = document.querySelectorAll(".bpmn-shape");

  bpmnShapes.forEach(shape => {
    const shapeName = shape.getAttribute("data-shape");
    const bpmnIcon = shape.querySelector(".bpmn-icon");
    const shapeDescription = shape.querySelector(".shape-description");

    if (shapeName && pngDict[shapeName]) {
      bpmnIcon.src = pngDict[shapeName];
      bpmnIcon.alt = shapeName;
    } else {
      bpmnIcon.style.display = "none"; // Hide the image if not found in the dictionary
    }
  });
});
