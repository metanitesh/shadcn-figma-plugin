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

export const App = () => {
  // Mock data for Naruto characters

  const [selectedCharacter, setSelectedCharacter] = useState<
    (typeof libraryData)[0] | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [activeTab, setActiveTab] = useState("content-library");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [libraryData, setLibraryData] = useState<any>([]);

  const fetchLibrary = async () => {
    dispatchTS("fetchLibrary", {});
  };

  const onClickCreate = () => {
    if (!selectedCharacter) {
      return;
    }
    dispatchTS("createSvg", {
      svg: selectedCharacter.id,
    });
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

      // Alternative direct fetch approach with CORS headers

      // Send sign in request to main thread
      // dispatchTS("signIn", {
      //   username,
      //   password,
      // });

      // Listen for response from main thread
      // window.onmessage = (event) => {
      //   if (event.data.pluginMessage.type === "signInResponse") {
      //     if (event.data.pluginMessage.success) {
      //       console.log("Sign in successful");
      //       dispatchTS("closePlugin", {});
      //     } else {
      //       console.error("Sign in failed:", event.data.pluginMessage.error);
      //     }
      //     setIsSigningIn(false);
      //   }
      // };
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
    }
  };

  // Group characters by type

  window.onmessage = (event) => {
    const pluginMessage = event.data.pluginMessage;
    if (pluginMessage) {
      // Check the type of message
      if (pluginMessage.type === "libraryData") {
        // Process the data received
        // You can update the UI or perform other actions based on the data.
        setLibraryData(pluginMessage.data?.items);
      }
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col items-center gap-4 py-10">
        <div className="w-full max-w-md">
          <Tabs defaultValue="sign-in" className="mb-6 w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger
                value="content-library"
                onClick={() => {
                  console.log("Fetching library----------->");
                  fetchLibrary();
                }}
              >
                Content Library
              </TabsTrigger>
              <TabsTrigger value="brand-guidelines">
                Brand Guidelines
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleSignIn}
                    disabled={isSigningIn || !username || !password}
                  >
                    {isSigningIn ? "Signing In..." : "Sign In"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="content-library">
              <Input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />

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
                              libraryItem.tag.map((tag: any, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
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

              <div className="mt-4 flex justify-between">
                <Button onClick={onClickCreate} disabled={!selectedCharacter}>
                  Create
                </Button>
                <Button variant="outline" onClick={onClickClose}>
                  Close
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="brand-guidelines">
              <div className="rounded-md border p-4">
                Select text to apply brand guidelines
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};
