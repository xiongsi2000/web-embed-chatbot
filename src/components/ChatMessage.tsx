import ChatbotIcon from "./ChatbotIcon";
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ chat }) => {
  return (
    !chat.hideInChat && (
      <div className={`message ${chat.type}-message ${chat.isError ? 'error' : ''}`}>
        {chat.type === "bot" && <ChatbotIcon />}
        <div className="message-text">
          <ReactMarkdown>{chat.text}</ReactMarkdown>
        </div>
      </div>
    )
  );
};

export default ChatMessage;