import {
  accordion,
  button,
  checkbox,
  input,
  radio,
  textarea,
} from "./components";

figma.showUI(__html__, {
  width: 400,
});

figma.ui.onmessage = (msg: { type: string; component: string }) => {
  const nodes: SceneNode[] = [];
  if (msg.type === "create-component") {
    try {
      let node;
      switch (msg.component) {
        case "button":
          node = figma.createNodeFromSvg(button);
          break;
        case "checkbox":
          node = figma.createNodeFromSvg(checkbox);
          break;
        case "radio":
          node = figma.createNodeFromSvg(radio);
          break;
        case "input":
          node = figma.createNodeFromSvg(input);
          break;
        case "textarea":
          node = figma.createNodeFromSvg(textarea);
          break;
        case "accordion":
          node = figma.createNodeFromSvg(accordion);
          break;
        default:
          figma.notify("Unknown component type");
          return;
      }

      figma.currentPage.appendChild(node);
      nodes.push(node);

      figma.viewport.scrollAndZoomIntoView([node]);

      figma.notify("SVG component created successfully!");
    } catch (error) {
      console.error("Error creating SVG node:", error);
      figma.notify(
        "Failed to create SVG component. Check console for details."
      );
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  figma.closePlugin();
};
