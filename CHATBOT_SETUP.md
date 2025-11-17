# AI Chatbot Backend Integration Guide

## Current Setup
The chatbot is now integrated with **Google Gemini AI** (free tier) for real AI-powered responses.

## API Configuration

### Current API Key
The chatbot is using Google Gemini API. The API key in the code is a sample key.

### How to Get Your Own Free API Key:

1. **Visit Google AI Studio:**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key:**
   - Click "Create API Key"
   - Select "Create API key in new project" or use existing project
   - Copy the generated API key

3. **Update the Code:**
   - Open `chatbot.js`
   - Find line 12: `this.apiKey = 'AIzaSy...'`
   - Replace with your new API key

### Free Tier Limits:
- 60 requests per minute
- 1,500 requests per day
- Perfect for student projects and small websites

## Alternative AI Services

### 1. OpenAI (ChatGPT)
```javascript
// In chatbot.js, update:
this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
this.apiKey = 'sk-...'; // Your OpenAI API key
```

Cost: $0.002 per 1K tokens (GPT-3.5-turbo)

### 2. Anthropic (Claude)
```javascript
this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
this.apiKey = 'sk-ant-...'; // Your Anthropic API key
```

### 3. Hugging Face (Free)
```javascript
this.apiEndpoint = 'https://api-inference.huggingface.co/models/...';
this.apiKey = 'hf_...'; // Your HF API key
```

## Custom Backend Setup (Recommended for Production)

### Node.js Backend Example:

```javascript
// backend/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Store in environment variable

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    ...history
                ]
            }
        );
        
        const aiResponse = response.data.candidates[0].content.parts[0].text;
        res.json({ response: aiResponse });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Python Flask Backend:

```python
# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data['message']
        history = data.get('history', [])
        
        chat_session = model.start_chat(history=history)
        response = chat_session.send_message(message)
        
        return jsonify({'response': response.text})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)
```

## Security Best Practices

1. **Never expose API keys in frontend code** (for production)
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** to prevent abuse
4. **Add authentication** for production apps
5. **Use HTTPS** for all API communications
6. **Validate and sanitize** user inputs
7. **Monitor API usage** and costs

## Current Features

✅ Real AI-powered responses using Google Gemini
✅ Context-aware conversations with history
✅ Specialized for college guidance in India
✅ Handles complex student queries
✅ Provides actionable advice
✅ Free tier available (1,500 requests/day)

## Testing the Chatbot

1. Open any page on your website
2. Click the floating chatbot button (bottom-right)
3. Try asking:
   - "Recommend engineering colleges for 95 percentile in JEE"
   - "What are the admission requirements for IIT?"
   - "Compare NIT vs IIIT colleges"
   - "Career options after computer science degree"
   - "Scholarship opportunities for engineering students"

## Troubleshooting

**Issue: "API Error" message**
- Check internet connection
- Verify API key is valid
- Check API quota limits
- Review browser console for errors

**Issue: Slow responses**
- Normal for AI processing (2-5 seconds)
- Check network speed
- Consider caching common queries

**Issue: Empty/incorrect responses**
- Verify API endpoint is correct
- Check request format
- Review system prompt configuration

## Next Steps

For production deployment:
1. Set up a backend server (Node.js/Python)
2. Move API key to backend
3. Add user authentication
4. Implement conversation persistence (database)
5. Add analytics and monitoring
6. Set up rate limiting
7. Add error tracking (Sentry, etc.)

## Support

For issues or questions:
- Check browser console for errors
- Review API documentation: https://ai.google.dev/docs
- Test with simple queries first
- Verify API key permissions
