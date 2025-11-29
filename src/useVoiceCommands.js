import { useCallback, useState, useMemo } from 'react';

export const useVoiceCommands = (callbacks = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  // Check browser support - memoize to prevent dependency changes
  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return SpeechRecognition ? new SpeechRecognition() : null;
  }, []);

  const processVoiceCommand = useCallback((command) => {
    // Add new task
    if (command.includes('add task') || command.includes('new task')) {
      const taskText = command.replace(/add task|new task/g, '').trim();
      if (callbacks.addTask && taskText) {
        callbacks.addTask(taskText);
      }
      return;
    }

    // Complete/check task
    if (command.includes('complete') || command.includes('done') || command.includes('check')) {
      if (callbacks.completeTask) {
        callbacks.completeTask();
      }
      return;
    }

    // Sync data
    if (command.includes('sync') || command.includes('save')) {
      if (callbacks.sync) {
        callbacks.sync();
      }
      return;
    }

    // Create new list
    if (command.includes('new list') || command.includes('create list')) {
      const listName = command.replace(/new list|create list/g, '').trim();
      if (callbacks.createList && listName) {
        callbacks.createList(listName);
      }
      return;
    }

    // Toggle theme
    if (command.includes('dark mode') || command.includes('light mode') || command.includes('toggle')) {
      if (callbacks.toggleTheme) {
        callbacks.toggleTheme();
      }
      return;
    }

    // Clear completed
    if (command.includes('clear completed') || command.includes('remove completed')) {
      if (callbacks.clearCompleted) {
        callbacks.clearCompleted();
      }
      return;
    }

    // Show help
    if (command.includes('help') || command.includes('commands')) {
      if (callbacks.showHelp) {
        callbacks.showHelp();
      }
      return;
    }
  }, [callbacks]);

  const startListening = useCallback(() => {
    if (!recognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      // Process commands
      if (finalTranscript) {
        processVoiceCommand(finalTranscript.toLowerCase().trim());
      }
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [recognition, processVoiceCommand]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    supported: !!recognition
  };
};
