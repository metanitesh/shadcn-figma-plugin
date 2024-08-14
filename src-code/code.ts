import {
  accordion,
  button,
  checkbox,
  input,
  radio,
  textarea,
} from "./components";
import { components } from "./types";
import { listenTS } from "./utils/code-utils";

const componentMap: Record<components, string> = {
  button,
  checkbox,
  radio,
  input,
  textarea,
  accordion,
};

figma.showUI(__html__, {
  width: 720,
  height: 480,
});

listenTS("createComponent", (res) => {
  const svg = componentMap[res.component];

  const node = figma.createNodeFromSvg(svg);
  figma.currentPage.appendChild(node);

  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);

  figma.notify("SVG component created successfully!");

  figma.closePlugin();
});
