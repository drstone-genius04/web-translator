const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let user1Messages = [];
let user2Messages = [];

app.get('/', (req, res) => {
  let history1 = user1Messages.map(message => `<p>${message[0]}: ${message[1]}</p>`).join('\n');
  let history2 = user2Messages.map(message => `<p>${message[0]}: ${message[1]}</p>`).join('\n');

  res.send(`
    <h1>ChatGPT - Translator</h1>
    <form action="/send/user1" method="post">
        <label for="user1">User 1:</label><br>
        <input type="text" id="user1" name="message"><br>
        <input type="submit" value="User 1 Send">
    </form>
    <form action="/send/user2" method="post">
        <label for="user2">User 2:</label><br>
        <input type="text" id="user2" name="message"><br>
        <input type="submit" value="User 2 Send">
    </form>
    <h2>Chat History for User 1:</h2>
    ${history1}
    <h2>Chat History for User 2:</h2>
    ${history2}
  `);
});

app.post('/send/:user', async (req, res) => {
  const { user } = req.params;
  const targetLanguage = user === 'user1' ? 'es' : 'en';
  const message = req.body.message;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message format.' });
  }

  try {
    const translatedMessage = await translateMessage(message, targetLanguage);

    if (user === 'user1') {
      user1Messages.push(['User 1 (English)', message]);
      user1Messages.push(['ChatGPT (Spanish)', translatedMessage]);
    } else if (user === 'user2') {
      user2Messages.push(['User 2 (Spanish)', message]);
      user2Messages.push(['ChatGPT (English)', translatedMessage]);
    }

    return res.status(200).json({ translated_message: translatedMessage });
  } catch (error) {
    console.error('Translation failed:', error);
    return res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

const translateMessage = async (message, targetLanguage) => {
  const prompt = `Translate the following text to ${targetLanguage}: ${message}`;

  const response = await axios.post('https://api.openai.com/v1/completions', {
    "prompt": prompt,
    "model": "text-davinci-002",
    "temperature": 0.7,
    "max_tokens": 200
  }, {
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    }
  });

  const translatedMessage = response.data.choices[0].text.trim();
  return translatedMessage;
};

app.listen(3000, () => console.log('Server is running on port 3000.'));
