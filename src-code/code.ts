import svgMapping from "./lib/svg-mapping";
import { listenTS } from "./utils/code-utils";

figma.showUI(__html__, {
  width: 500,
  height: 600,
  title: "Draft Alpha",
});

(async () => {
  const token = await figma.clientStorage.getAsync("authToken");
  figma.ui.postMessage({
    type: "pageLoadauthToken",
    data: {
      token: token,
    },
  });
})();

listenTS("logout", () => {
  figma.clientStorage.deleteAsync("authToken");
  figma.ui.postMessage({
    type: "authToken",
    data: {
      token: null,
    },
  });
});

listenTS("closePlugin", () => {
  figma.closePlugin();
});

listenTS("fetchLibrary", async (msg) => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/library/get?token=" +
        (await figma.clientStorage.getAsync("authToken")),
    );

    const data = await response.json();

    console.log("Library data in code.ts----*******-->:", data);

    if (response.ok) {
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

// Add this function to get selected text nodes
function getSelectedTextNodes() {
  const selection = figma.currentPage.selection;
  const textNodes = selection.filter(
    (node): node is TextNode => node.type === "TEXT",
  );
  return textNodes;
}

// Add this listener to handle text selection
listenTS("getSelectedText", () => {
  const textNodes = getSelectedTextNodes();

  if (textNodes.length === 0) {
    figma.ui.postMessage({
      type: "selectedText",
      data: {
        text: null,
        error: "No text selected",
      },
    });
    return;
  }

  // Get text content from all selected text nodes
  const selectedText = textNodes.map((node) => ({
    id: node.id,
    characters: node.characters,
    fontSize: node.fontSize,
    fontName: node.fontName,
  }));

  figma.ui.postMessage({
    type: "selectedText",
    data: {
      text: selectedText,
      error: null,
    },
  });
});
