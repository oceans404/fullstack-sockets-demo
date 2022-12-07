import { useState, useRef, useEffect } from "react";
import { Container } from "@chakra-ui/react";
import "./App.css";
import { SingleFieldForm } from "./SingleFieldForm";

function App() {
  const ref = useRef(null);
  const [userName, setUserName] = useState(null);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    scrollToNewChat();
  }, [chats]);

  const handleSendMessage = ({ Message }) => {
    setChats([...chats, { userName, message: Message }]);
  };

  const handleUsername = ({ Username }) => {
    setUserName(Username);
  };

  const scrollToNewChat = () => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  return (
    <div className="App">
      {!!userName ? (
        <Container w="90vw">
          <h1>{!!userName && `gm ${userName}`}</h1>
          <ul id="chat-scroll" ref={ref}>
            {chats.map((c) => (
              <li key={c.message} className="chat-message">
                {c.userName}: {c.message}
              </li>
            ))}
          </ul>
          <SingleFieldForm
            getFormValues={handleSendMessage}
            formField="Message"
            buttonText="Send"
          />
        </Container>
      ) : (
        <SingleFieldForm
          fullWidth
          getFormValues={handleUsername}
          formField="Username"
          buttonText="Chat"
        />
      )}
    </div>
  );
}

export default App;
