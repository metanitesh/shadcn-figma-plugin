import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";
import { dispatchTS } from "./utils/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ExternalLinkIcon, Loader, PowerIcon, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [libraryData, setLibraryData] = useState<any>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [brandFeedback, setBrandFeedback] = useState<{
    violatedGuidelines: {
      type: string;
      name: string;
      description: string;
      violation: string;
    }[];
    feedback: string;
    textId?: string;
  } | null>(null);
  const [writingFeedback, setWritingFeedback] = useState<{
    violatedRules: {
      type: string;
      name: string;
      description: string;
      violation: string;
    }[];
    feedback: string;
    textId?: string;
  } | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<
    (typeof libraryData)[0] | undefined
  >();
  const [checkOptions, setCheckOptions] = useState({
    brandGuideline: true,
    writingRules: false,
    referenceLibrary: false,
  });

  useEffect(() => {
    if (
      authToken && typeof authToken === "object"
        ? Object.keys(authToken).length > 0
        : authToken
    ) {
      fetchLibrary();
    }
  }, [authToken]);

  const fetchLibrary = async () => {
    dispatchTS("fetchLibrary", {});
  };

  const onClickClose = () => {
    dispatchTS("closePlugin", {});
  };

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);

      // Send sign in request with CORS headers
      dispatchTS("signIn", {
        username,
        password,
      });
      setIsSigningIn(false);
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
    }
  };

  const handleLogout = () => {
    // Clear auth token from state
    setAuthToken(null);

    // Send message to remove token from client storage
    dispatchTS("logout", {});
  };

  const getSelectedText = () => {
    dispatchTS("getSelectedText", {});
  };

  const applyGuidelines = async (textId: string, textToImprove: string) => {
    try {
      // Set loading state for this specific text
      setIsProcessing((prev) => ({ ...prev, [textId]: true }));

      // Apply brand guidelines if selected
      if (checkOptions.brandGuideline) {
        const validationResponse = await fetch(
          "http://localhost:3000/api/validate/brand-foundation/check",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              authToken,
              textToImprove,
              includeWritingFoundation: checkOptions.writingRules,
            }),
          },
        );

        const data = await validationResponse.json();
        console.log("Brand foundation validation:", data);

        // Store the feedback in state
        setBrandFeedback({
          violatedGuidelines: data.violatedGuidelines || [],
          feedback: data.feedback || "",
          textId: textId,
        });
      }

      // Apply reference library check if selected
      if (checkOptions.referenceLibrary) {
        // Add implementation for reference library check
        console.log("Reference library check requested for:", textToImprove);
        // You would add the API call here
      }

      // Apply writing rules if selected (if not already included in brand guidelines)
      if (checkOptions.writingRules) {
        const validationResponse = await fetch(
          "http://localhost:3000/api/validate/writing-rules/check",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              authToken,
              textToImprove,
            }),
          },
        );

        const data = await validationResponse.json();
        console.log("Writing rules validation:", data);

        // Store the feedback in state
        setWritingFeedback({
          violatedRules: data.violatedRules || [],
          feedback: data.feedback || "",
          textId: textId,
        });
      }
    } catch (error) {
      console.error("Error applying guidelines:", error);
    } finally {
      // Clear loading state
      setIsProcessing((prev) => ({ ...prev, [textId]: false }));
    }
  };

  window.onmessage = (event) => {
    const pluginMessage = event.data.pluginMessage;
    if (pluginMessage) {
      if (pluginMessage.type === "libraryData") {
        setLibraryData(pluginMessage.data?.items);
      }

      if (pluginMessage.type === "signInResponse") {
        setAuthToken(pluginMessage?.token);
      }

      if (pluginMessage.type === "pageLoadauthToken") {
        const token = pluginMessage.data?.token;
        if (token || Object.keys(token || {}).length === 0) {
          setAuthToken(token);
        }
      }

      if (pluginMessage.type === "selectedText") {
        if (pluginMessage.data.error) {
          console.error(pluginMessage.data.error);
        } else {
          setSelectedText(pluginMessage.data.text);
        }
      }
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col items-center gap-4">
        <div className="w-full max-w-md">
          {!authToken ? (
            // Show only sign-in tab when no auth token

            <div className="my-14 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-gray-800">Sign In</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your credentials to access your account
                </p>
              </div>
              <div className="mb-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <Button
                className="w-full rounded-md bg-orange-600 py-2 text-white transition-colors hover:bg-orange-700"
                onClick={handleSignIn}
                disabled={isSigningIn || !username || !password}
              >
                {isSigningIn ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          ) : (
            // Show content library and brand guidelines tabs when authenticated
            <div className="relative">
              <Tabs defaultValue="brand-guidelines" className="mb-6 w-full">
                <TabsList className="flex w-full items-center justify-between border-b bg-white p-1 shadow-none">
                  <TabsTrigger
                    value="brand-guidelines"
                    className="px-3 py-1.5 text-sm font-medium shadow-none active:bg-red-200"
                  >
                    Brand Guidelines
                  </TabsTrigger>
                  <div className="flex">
                    <TabsTrigger
                      value="content-library"
                      onClick={() => {
                        fetchLibrary();
                      }}
                      className="px-3 py-1.5 text-sm font-medium shadow-none active:bg-red-200"
                    >
                      Content Library
                    </TabsTrigger>
                  </div>
                  <div className="flex items-center space-x-2 pr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      title="Open Web App"
                    >
                      <a
                        href="https://brandvoice.draftalpha.com"
                        target="_blank"
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      title="Sign Out"
                      onClick={handleLogout}
                    >
                      <PowerIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsList>
                <TabsContent value="brand-guidelines">
                  <div className="absolute -top-4 right-0 mb-4 flex justify-end"></div>
                  <div className="rounded-md border p-4">
                    <Button
                      onClick={getSelectedText}
                      className="mb-4 bg-orange-500 px-3 py-1 text-sm hover:bg-orange-600"
                    >
                      Connect selected frame
                    </Button>

                    {selectedText && (
                      <div className="space-y-2">
                        {selectedText.map((text: any) => (
                          <div key={text.id} className="rounded bg-gray-50 p-2">
                            <p className="text-sm">Text: {text.characters}</p>

                            <div className="mt-2 space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`brand-guideline-${text.id}`}
                                  checked={checkOptions.brandGuideline}
                                  onCheckedChange={(checked) =>
                                    setCheckOptions((prev) => ({
                                      ...prev,
                                      brandGuideline: !!checked,
                                    }))
                                  }
                                />
                                <Label
                                  htmlFor={`brand-guideline-${text.id}`}
                                  className="text-sm"
                                >
                                  Apply Brand Guideline
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`writing-rules-${text.id}`}
                                  checked={checkOptions.writingRules}
                                  onCheckedChange={(checked) =>
                                    setCheckOptions((prev) => ({
                                      ...prev,
                                      writingRules: !!checked,
                                    }))
                                  }
                                />
                                <Label
                                  htmlFor={`writing-rules-${text.id}`}
                                  className="text-sm"
                                >
                                  Writing Rules
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`reference-library-${text.id}`}
                                  checked={checkOptions.referenceLibrary}
                                  onCheckedChange={(checked) =>
                                    setCheckOptions((prev) => ({
                                      ...prev,
                                      referenceLibrary: !!checked,
                                    }))
                                  }
                                />
                                <Label
                                  htmlFor={`reference-library-${text.id}`}
                                  className="text-sm"
                                >
                                  Reference Library
                                </Label>
                              </div>
                            </div>

                            <Button
                              className="mt-4 bg-orange-500 px-3 py-1 text-sm hover:bg-orange-600"
                              onClick={() =>
                                applyGuidelines(text.id, text.characters)
                              }
                              disabled={
                                isProcessing[text.id] ||
                                (!checkOptions.brandGuideline &&
                                  !checkOptions.writingRules &&
                                  !checkOptions.referenceLibrary)
                              }
                            >
                              {isProcessing[text.id] ? (
                                <span className="flex items-center">
                                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </span>
                              ) : (
                                "Apply Guidelines"
                              )}
                            </Button>

                            {brandFeedback &&
                              brandFeedback.textId === text.id && (
                                <div className="mt-4 rounded border border-gray-200 p-3">
                                  <h3 className="mb-2 text-sm font-medium">
                                    Brand Guidelines Analysis
                                  </h3>

                                  {brandFeedback.violatedGuidelines &&
                                    brandFeedback.violatedGuidelines.length >
                                      0 && (
                                      <div className="mb-3">
                                        <h4 className="mb-1 text-xs font-medium text-red-700">
                                          Violated Guidelines:
                                        </h4>
                                        <ul className="space-y-2">
                                          {brandFeedback.violatedGuidelines.map(
                                            (guideline, index) => (
                                              <li
                                                key={index}
                                                className="rounded-md border border-red-100 bg-red-50 p-2"
                                              >
                                                <div className="flex items-center text-xs font-medium text-red-800">
                                                  <XCircle className="mr-1 h-3 w-3 text-red-600" />
                                                  {guideline.type}:{" "}
                                                  {guideline.name}
                                                </div>
                                                {/* <p className="mt-1 text-xs text-gray-700">
                                                  {guideline.description}
                                                </p> */}
                                                <p className="mt-2 text-xs italic text-red-700">
                                                  {guideline.violation}
                                                </p>
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                  {/* {brandFeedback.feedback &&
                                    brandFeedback.feedback !== "." && (
                                      <div>
                                        <h4 className="mb-1 text-xs font-medium">
                                          Feedback:
                                        </h4>
                                        <p className="text-xs">
                                          {brandFeedback.feedback}
                                        </p>
                                      </div>
                                    )} */}
                                </div>
                              )}

                            {writingFeedback &&
                              writingFeedback.textId === text.id && (
                                <div className="mt-4 rounded border border-gray-200 p-3">
                                  <h3 className="mb-2 text-sm font-medium">
                                    Writing Rules Analysis
                                  </h3>

                                  {writingFeedback.violatedRules &&
                                    writingFeedback.violatedRules.length >
                                      0 && (
                                      <div className="mb-3">
                                        <h4 className="mb-1 text-xs font-medium text-red-700">
                                          Writing Issues:
                                        </h4>
                                        <ul className="space-y-2">
                                          {writingFeedback.violatedRules.map(
                                            (guideline, index) => (
                                              <li
                                                key={index}
                                                className="rounded-md border border-orange-100 bg-orange-50 p-2"
                                              >
                                                <div className="flex items-center text-xs font-medium text-orange-800">
                                                  <XCircle className="mr-1 h-3 w-3 text-orange-600" />
                                                  {guideline.type}:{" "}
                                                  {guideline.name}
                                                </div>
                                                <p className="mt-2 text-xs italic text-orange-700">
                                                  {guideline.violation}
                                                </p>
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                  {writingFeedback.feedback &&
                                    writingFeedback.feedback !== "." && (
                                      <div>
                                        <h4 className="mb-1 text-xs font-medium">
                                          Suggestions:
                                        </h4>
                                        <p className="text-xs">
                                          {writingFeedback.feedback}
                                        </p>
                                      </div>
                                    )}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="content-library">
                  <div className="mb-4 flex items-center justify-between">
                    <Input
                      type="text"
                      placeholder="Search characters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mr-2 flex-1"
                    />
                  </div>

                  <div className="rounded-md border">
                    <ul className="divide-y">
                      {libraryData.map((libraryItem: any) => (
                        <li
                          key={libraryItem.id}
                          className={`cursor-pointer p-3 hover:bg-gray-100 ${selectedCharacter?.id === libraryItem.id ? "bg-gray-100" : ""}`}
                          onClick={() => setSelectedCharacter(libraryItem)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="font-light">{libraryItem.copy}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {libraryItem.tag &&
                                  libraryItem.tag.map(
                                    (tag: any, index: number) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                                      >
                                        {tag}
                                      </span>
                                    ),
                                  )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {libraryItem.status === "active" && (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
