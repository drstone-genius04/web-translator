import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, CircularProgress } from '@material-ui/core';

const App = () => {
  const [user1Message, setUser1Message] = useState('');
  const [user2Message, setUser2Message] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (user, message, language) => {
    if (message === '') return;
    setLoading(true);
    setError(null);
    try {
      const translatedMessage = await translateMessage(message, language);

      const response = await axios.post(`http://localhost:3000/send/${user.toLowerCase()}`, {
        message: message,
      });

      if (response.status === 200) {
        setChatHistory(prevState => [...prevState, { user, message: translatedMessage }]);
        user === 'User 1' ? setUser1Message('') : setUser2Message('');
      }
    } catch (err) {
      setError('Translation failed. Please try again.');
    }
    setLoading(false);
  };

  const translateMessage = async (message, targetLanguage) => {
    const prompt = `Translate the following text to ${targetLanguage}: ${message}`;
    const response = await axios.post('https://api.openai.com/v1/completions', {
      engine: 'text-davinci-002',
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 200
    }, {
      headers: {
        'Authorization': 'Bearer your-api-key-here'
      }
    });

    const translatedMessage = response.data.choices[0].text.trim();
    return translatedMessage;
  };

  return (
    <Container>
      <Typography variant="h2">ChatGPT - Translator</Typography>

      <TextField
        label="User 1"
        variant="outlined"
        fullWidth
        value={user1Message}
        onChange={(e) => setUser1Message(e.target.value)}
        disabled={loading}
      />
      <Button variant="contained" color="primary" onClick={() => sendMessage('User 1', user1Message, 'es')} disabled={loading}>
        User 1 Send
      </Button>

      <TextField
        label="User 2"
        variant="outlined"
        fullWidth
        value={user2Message}
        onChange={(e) => setUser2Message(e.target.value)}
        disabled={loading}
      />
      <Button variant="contained" color="secondary" onClick={() => sendMessage('User 2', user2Message, 'en')} disabled={loading}>
        User 2 Send
      </Button>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      <Typography variant="h4">Chat History</Typography>
      <Box>
        {chatHistory.map((item, index) => (
          <Box key={index} m={2}>
            <Typography variant="h6">{item.user} (Translated):</Typography>
            <Typography variant="body1">{item.message}</Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default App;
