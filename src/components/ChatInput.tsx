/**
 * ChatInput Component
 * Text input for user questions with send button
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useIsStreaming } from '../store/chatStore';

interface ChatInputProps {
  onSend: (question: string) => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Ask a clinical question...',
}) => {
  const [inputText, setInputText] = useState('');
  const isStreaming = useIsStreaming();

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (trimmedText && !isStreaming) {
      onSend(trimmedText);
      setInputText('');
    }
  };

  const isDisabled = isStreaming || !inputText.trim();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!isStreaming}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.sendText, isDisabled && styles.sendTextDisabled]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendTextDisabled: {
    color: '#999',
  },
});
