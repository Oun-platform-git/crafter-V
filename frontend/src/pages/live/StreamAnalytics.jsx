import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { StreamAnalyticsAI } from '../../components/live-streaming/StreamAnalyticsAI';

export default function StreamAnalyticsPage() {
  return (
    <ChakraProvider>
      <div className="w-full h-full bg-gray-950">
        <StreamAnalyticsAI />
      </div>
    </ChakraProvider>
  );
}
