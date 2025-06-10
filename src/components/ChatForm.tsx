import { useRef, FormEvent } from "react";

interface ChatMessage {
  type: "user" | "bot";
  text: string;
}

interface ChatFormProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  generateBotResponse: (history: ChatMessage[]) => void;
}

const ChatForm: React.FC<ChatFormProps> = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputRef.current) return;
    
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;

    console.log(userMessage);
    inputRef.current.value = "";
    setChatHistory((prev: ChatMessage[]) => [...prev, { type: "user", text: userMessage }]);

    setTimeout(() => {
      setChatHistory((prev: ChatMessage[]) => [...prev, { type: "bot", text: "thinking..." }]);
      generateBotResponse([...chatHistory, { 
        type: "user", 
        text: userMessage 
      }]);
    }, 600);
  };

  return (
    <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="message-input"
        required
      />
      <button className="material-symbols-rounded">arrow_upward</button>
    </form>
  );
};

export default ChatForm;