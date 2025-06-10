import { useState, useRef, useEffect, MouseEvent } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { Assistant } from "./services/Assistant";
import { companyInfo } from "./conpanyinfo";

interface ChatMessage {
  type: "user" | "bot";
  text: string;
  hideInChat?: boolean;
  isError?: boolean;
}

interface FormattedMessage {
  role: "user" | "assistant";
  content: string;
}

const App = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{
    hideInChat: true,
    type: "bot",
    text: companyInfo
  }]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [modelType, setModelType] = useState<"deepseek" | "gemini">("deepseek");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const assistant = new Assistant(modelType);

  const generateBotResponse = async (history: ChatMessage[]) => {
    try {
      const lastMessage = history[history.length - 1];
      // Convert chat history to the format expected by the API
      const formattedHistory: FormattedMessage[] = history.map(msg => ({
        role: msg.type === "bot" ? "assistant" : "user",
        content: msg.text
      }));
      
      const response = await assistant.chat(lastMessage.text, formattedHistory);
      
      setChatHistory(prev => {
        const newHistory = [...prev];
        // Replace "thinking..." with actual response
        newHistory[newHistory.length - 1] = { 
          type: "bot", 
          text: response,
          hideInChat: false
        };
        return newHistory;
      });
    } catch (error: unknown) {
      console.error("Error generating response:", error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        // Replace "thinking..." with error message
        newHistory[newHistory.length - 1] = { 
          type: "bot", 
          text: error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.",
          hideInChat: false,
          isError: true
        };
        return newHistory;
      });
    }
  };
  
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chatHistory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as any);
    };
  }, []);

  const handleModelChange = (type: "deepseek" | "gemini") => {
    setModelType(type);
    setChatHistory([{
      hideInChat: true,
      type: "bot",
      text: `Switched to ${type === "gemini" ? "Gemini" : "DeepSeek"} model. How can I help you?`
    }]);
  };

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <div onClick={() => setShowChatbot(!showChatbot)} className="chatbot-toggler">
        <span className="material-symbols-rounded">chat</span>
        <span className="material-symbols-rounded">close</span>
      </div>

      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
            <div className="model-selector" ref={modelMenuRef}>
              <button 
                className="model-menu-btn"
                onClick={() => setShowModelMenu(!showModelMenu)}
              >
                <span className="material-symbols-rounded">menu</span>
              </button>
              <div className={`model-dropdown ${showModelMenu ? 'show' : ''}`}>
                <label className="model-option">
                  <input
                    type="radio"
                    name="model"
                    value="deepseek"
                    checked={modelType === "deepseek"}
                    onChange={() => handleModelChange("deepseek")}
                  />
                  <span className="model-name">DeepSeek</span>
                </label>
                <label className="model-option">
                  <input
                    type="radio"
                    name="model"
                    value="gemini"
                    checked={modelType === "gemini"}
                    onChange={() => handleModelChange("gemini")}
                  />
                  <span className="model-name">Gemini</span>
                </label>
              </div>
            </div>
          </div>
          <button onClick={() => setShowChatbot(!showChatbot)} className="material-symbols-rounded">keyboard_arrow_down</button>
        </div>

        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there 👋 <br /> How can I help you today?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat}/>
          ))}
        </div>

        <div className="chat-footer">
          <ChatForm 
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}  
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default App; 