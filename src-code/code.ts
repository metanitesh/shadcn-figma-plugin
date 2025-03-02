import svgMapping from "./lib/svg-mapping";
import { listenTS } from "./utils/code-utils";

figma.showUI(__html__, {
  width: 400,
  height: 600,
  title: "Draft Alpha",
});

listenTS("createSvg", (res) => {
  console.log("Received message----*******-->:", res);
  const svg = svgMapping[res.svg];

  const node = figma.createNodeFromSvg(svg);
  figma.currentPage.appendChild(node);

  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);

  figma.notify("SVG component created successfully!");

  figma.closePlugin();
});

listenTS("closePlugin", () => {
  figma.closePlugin();
});

listenTS("fetchLibrary", (res) => {
  console.log("Received message----*******-->:", res);
  figma.clientStorage.setAsync("libraryData", res.libraryData);
});

listenTS("signIn", async () => {
  console.log("Received message----*******-->:");
  try {
    const response = await fetch("http://localhost:3000/api/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    const data = await response.json();

    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
});
