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
  const characterData = [
    {
      id: "tooltip",
      name: "Configure your campaign to target the right customers",
      type: "button",
    },
    {
      id: "area_selection_title",
      name: "Area targeting",
      type: "title",
    },
    {
      id: "area_selection_subtitle",
      name: "We maximize your results by targeting all customers in your delivery area. To focus your campaign, please edit the promotional areas.",
      type: "subtitle",
    },
    {
      id: "area_selection_disabled",
      name: "We maximize your results by targeting all customers in your delivery area.",
      type: "text",
    },
    {
      id: "area_selection_description",
      name: "Your restaurant will be promoted where the promotional areas overlap your delivery area. Click on the green promotional areas to remove or add to your campaign.",
      type: "description",
    },
    {
      id: "edit_all_promo_areas_selected",
      name: "Your ad is targeting customers in all the promotional areas.",
      type: "status",
    },
    {
      id: "all_promo_areas_selected",
      name: "Your ad will target customers in all the promotional areas.",
      type: "info",
    },
  ];

  const [selectedCharacter, setSelectedCharacter] = useState<
    (typeof characterData)[0] | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCharacters, setFilteredCharacters] = useState(characterData);
  const [activeTab, setActiveTab] = useState("content-library");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Filter characters based on search query
    const filtered = characterData.filter((character) =>
      character.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredCharacters(filtered);
  }, [searchQuery]);

  const fetchLibrary = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/library/get?token=" +
          localStorage.getItem("DraftAlpha-authToken"),
      );

      const data = await response.json();
      console.log("Library data:", data);

      // Send library data to the plugin code
      dispatchTS("fetchLibrary", {
        libraryData: data,
      });
    } catch (error) {
      console.error("Error fetching library data:", error);
    }
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

      console.log("Signing in with:", { username, password });
      // Send sign in request with CORS headers
      dispatchTS("signIn", {
        username,
        password,
      });

      // Alternative direct fetch approach with CORS headers
      try {
        // const response1 = await fetch("https://cat-fact.herokuapp.com/facts", {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //     "Access-Control-Allow-Origin": "*",
        //   },
        //   mode: "cors",
        // });

        // console.log("response1--->", await response1.json());

        const response = await fetch(
          "http://localhost:3000/api/externtal-auth",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Login successful:", data);
          const token = data?.token;

          // Store token in localStorage
          if (token) {
            localStorage.setItem("DraftAlpha-authToken", token);
          }

          // Handle successful login
          // dispatchTS("closePlugin", {});
        } else {
          console.error("Login failed:", await response.text());
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
      }
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
  const groupedCharacters = filteredCharacters.reduce(
    (acc, character) => {
      if (!acc[character.type]) {
        acc[character.type] = [];
      }
      acc[character.type].push(character);
      return acc;
    },
    {} as Record<string, typeof characterData>,
  );

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
                {Object.keys(groupedCharacters).length > 0 ? (
                  <Accordion
                    type="multiple"
                    className="w-full"
                    defaultValue={Object.keys(groupedCharacters)}
                  >
                    {Object.entries(groupedCharacters).map(
                      ([type, characters]) => (
                        <AccordionItem key={type} value={type}>
                          <AccordionTrigger className="px-3 py-2 font-medium capitalize">
                            {type} ({characters.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="divide-y">
                              {characters.map((character) => (
                                <li
                                  key={character.id}
                                  className={`cursor-pointer p-3 hover:bg-gray-100 ${selectedCharacter?.id === character.id ? "bg-gray-100" : ""}`}
                                  onClick={() =>
                                    setSelectedCharacter(character)
                                  }
                                >
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="font-light">
                                        {character.name}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ),
                    )}
                  </Accordion>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No characters found
                  </div>
                )}
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
