import svgMapping from "./lib/svg-mapping";
import { listenTS } from "./utils/code-utils";

figma.showUI(__html__, {
  width: 500,
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

listenTS("fetchLibrary", async (msg) => {
  console.log("Fetching library in code.ts----*******-->:", msg);
  try {
    const response = await fetch(
      "http://localhost:3000/api/library/get?token=" +
        (await figma.clientStorage.getAsync("authToken")),
    );

    const data = await response.json();

    console.log("Library data in code.ts----*******-->:", data);

    if (response.ok) {
      // Store library data in client storage

      // Send library data back to UI
      figma.ui.postMessage({
        type: "libraryData",
        data: data,
      });
    } else {
      console.error("Failed to fetch library:", data);
    }
  } catch (error) {
    console.error("Error fetching library:", error);
  }
});

listenTS("signIn", async (msg) => {
  try {
    const response = await fetch("http://localhost:3000/api/externtal-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: msg.username,
        password: msg.password,
      }),
    });

    const data = await response.json();

    console.log("Sign in response in code.ts----*******-->:", data);
    figma.clientStorage.setAsync("authToken", data.token);

    if (response.ok) {
      // Send success response with token back to UI
      figma.ui.postMessage({
        type: "signInResponse",
        success: true,
        token: data.token,
      });
    } else {
      figma.ui.postMessage({
        type: "signInResponse",
        success: false,
        error: data.message || "Login failed",
      });
    }
  } catch (error) {
    figma.ui.postMessage({
      type: "signInResponse",
      success: false,
      error: "Network error occurred",
    });
  }
});
