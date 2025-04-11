import React, { useState } from "react";
import { ShortsCrafter } from "../components/shorts-crafter/ShortsCrafter";
import { ChakraProvider } from "@chakra-ui/react";

export default function Shorts() {
  const handleSave = async (videoData) => {
    try {
      // TODO: Implement save logic
      console.log("Saving video:", videoData);
    } catch (error) {
      console.error("Error saving video:", error);
    }
  };

  const handleShare = async (platform, data) => {
    try {
      // TODO: Implement share logic
      console.log("Sharing to", platform, ":", data);
    } catch (error) {
      console.error("Error sharing video:", error);
    }
  };

  return (
    <ChakraProvider>
      <div className="w-full h-full bg-gray-950">
        <ShortsCrafter onSave={handleSave} onShare={handleShare} />
      </div>
    </ChakraProvider>
  );
}
