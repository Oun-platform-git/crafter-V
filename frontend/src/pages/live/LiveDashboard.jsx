import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { LiveStreamDashboard } from '../../components/live-streaming/LiveStreamDashboard';

export default function LiveDashboardPage() {
  return (
    <ChakraProvider>
      <div className="w-full h-full bg-gray-950">
        <LiveStreamDashboard />
      </div>
    </ChakraProvider>
  );
}
