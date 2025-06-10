# Web Embed Chatbot

A modern, customizable chatbot widget that can be easily embedded into any website. Built with React and Vite, supporting multiple AI models including DeepSeek and Gemini.

## Features

- 🎨 Modern and clean UI design
- 🔄 Support for multiple AI models (DeepSeek and Gemini)
- 🎯 Easy to embed and customize
- 💬 Real-time chat functionality
- 🏢 Built-in RAG with CompanyInfo integration

## Installation

1. Clone the repository:
```bash
git clone https://github.com/xiongsi2000/web-embed-chatbot.git
cd web-embed-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```env
VITE_DEEPSEEK_AI_API_KEY=your_deepseek_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server:
```bash
npm run dev
```

## Usage

### Customizing CompanyInfo

To customize the company information, simply modify the `companyInfo` object in your implementation. You can:

1. Add your company's name and description
2. Include your product information
3. Add frequently asked questions and answers
4. Include any other relevant company information

Example A:
```javascript
export const companyInfo = `
Company: ABC

About Us:
- Leading provider of innovative solutions in the technology sector
- Founded in 2010, serving over 1000+ clients worldwide
- Committed to delivering cutting-edge technology solutions

Products & Services:
1. Cloud Platform
   - Enterprise-grade cloud infrastructure
   - 99.9% uptime guarantee
   - 24/7 technical support

2. AI Assistant
   - Smart virtual assistant for businesses
   - Natural language processing
   - Customizable workflows

3. Data Analytics
   - Real-time data processing
   - Advanced visualization tools
   - Predictive analytics

Contact Information:
- Email: support@acmecorp.com
- Phone: +1 (555) 123-4567
- Address: 123 Tech Street, Silicon Valley, CA

Business Hours:
- Monday to Friday: 9 AM to 6 PM EST
- Saturday: 10 AM to 2 PM EST
- Sunday: Closed

Technical Support:
- Available 24/7 for all products
- Response time: < 2 hours
- Dedicated support team
`
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 