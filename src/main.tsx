import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import type { narutoCharacter } from "./lib/types";
import { dispatchTS } from "./utils/utils";
import svgs from "./lib/svgs";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLinkIcon, Link, PowerIcon } from "lucide-react";

export const App = () => {
  // Mock data for Naruto characters

  const [selectedCharacter, setSelectedCharacter] = useState<
    (typeof libraryData)[0] | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [libraryData, setLibraryData] = useState<any>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<any>(null);

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

  // Group characters by type

  const getSelectedText = () => {
    dispatchTS("getSelectedText", {});
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
              <Tabs defaultValue="content-library" className="mb-6 w-full">
                <TabsList className="flex w-full items-center justify-between border-b bg-white p-1 shadow-none">
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
                    <TabsTrigger
                      value="brand-guidelines"
                      className="px-3 py-1.5 text-sm font-medium shadow-none active:bg-red-200"
                    >
                      Brand Guidelines
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

                  {/* <div className="mt-4 flex justify-between"> */}
                  {/* <Button
                      onClick={onClickCreate}
                      disabled={!selectedCharacter}
                    >
                      Create
                    </Button>
                    <Button variant="outline" onClick={onClickClose}>
                      Close
                    </Button> */}
                  {/* </div> */}
                </TabsContent>

                <TabsContent value="brand-guidelines">
                  <div className="absolute -top-4 right-0 mb-4 flex justify-end"></div>
                  <div className="rounded-md border p-4">
                    <Button onClick={getSelectedText} className="mb-4">
                      Get Selected Text
                    </Button>

                    {selectedText && (
                      <div className="space-y-2">
                        {selectedText.map((text: any) => (
                          <div key={text.id} className="rounded bg-gray-50 p-2">
                            <p className="text-sm">Text: {text.characters}</p>
                            <p className="text-xs text-gray-500">
                              Font:{" "}
                              {typeof text.fontName === "object"
                                ? text.fontName.family
                                : text.fontName}
                              {text.fontSize && `, Size: ${text.fontSize}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
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
