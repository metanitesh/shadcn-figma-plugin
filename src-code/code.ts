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
      "https://brandvoice.draftalpha.com/api/library/get?token=" +
        (await figma.clientStorage.getAsync("authToken")),
    );

    const data = await response.json();

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
    const response = await fetch(
      "https://brandvoice.draftalpha.com/api/externtal-auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: msg.username,
          password: msg.password,
        }),
      },
    );

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
  }));

  figma.ui.postMessage({
    type: "selectedText",
    data: {
      text: selectedText,
      error: null,
    },
  });
});
listenTS("applyText", async (msg) => {
  const textNodes = getSelectedTextNodes();
  if (textNodes.length === 0) {
    figma.ui.postMessage({
      type: "applyTextResponse",
      data: {
        success: false,
        error: "No text selected",
      },
    });
    return;
  } else {
    try {
      // Load fonts for each text node before modifying text
      for (const node of textNodes) {
        // Get all fonts used in the node
        const fontNames = node.getRangeAllFontNames(0, node.characters.length);
        // Load each font
        for (const font of fontNames) {
          await figma.loadFontAsync(font);
        }
      }

      // After fonts are loaded, update the text
      textNodes.forEach((node) => {
        node.characters = msg.text;
      });

      figma.ui.postMessage({
        type: "applyTextResponse",
        data: {
          success: true,
        },
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "applyTextResponse",
        data: {
          success: false,
          error: "Failed to load fonts: " + error.message,
        },
      });
    }
  }
});
