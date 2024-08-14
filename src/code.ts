import {
  accordion,
  button,
  checkbox,
  input,
  radio,
  textarea,
} from "./components";
import { components } from "./types";

const componentMap: Record<components, string> = {
  button,
  checkbox,
  radio,
  input,
  textarea,
  accordion,
};

figma.showUI(__html__, {
  width: 400,
});

figma.ui.onmessage = (msg: { type: string; component: components }) => {
  if (msg.type === "create-component") {
    try {
      const svg = componentMap[msg.component];

      const node = figma.createNodeFromSvg(svg);
      figma.currentPage.appendChild(node);

      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);

      figma.notify("SVG component created successfully!");
    } catch (error) {
      console.error("Error creating SVG node:", error);
      figma.notify(
        "Failed to create SVG component. Check console for details."
      );
    }
  }

  figma.closePlugin();
};
