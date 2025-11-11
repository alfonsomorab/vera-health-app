/**
 * Vera Health App
 * AI Streaming Chat Application
 */

import React from 'react';
import { ChatScreen } from './src/screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return <SafeAreaProvider>
    <ChatScreen />
  </SafeAreaProvider>;
  
  
}
