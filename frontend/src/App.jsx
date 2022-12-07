import { useState, useRef, useEffect } from "react";
import { Container } from "@chakra-ui/react";
import "./App.css";
import { SingleFieldForm } from "./SingleFieldForm";
import { connectToSocket } from "./socket";

function App() {
  const ref = useRef(null);
  const [userName, setUserName] = useState(null);
  const [chats, setChats] = useState([]);

  const handleNewMessage = (vals) => {
    setChats([...chats, vals]);
  };

  useEffect(() => {
    scrollToNewChat();
    connectToSocket();
  }, [chats]);

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
              <li k={c.Message} className="chat-message">
                {userName}: {c.Message}
              </li>
            ))}
          </ul>
          <SingleFieldForm
            getFormValues={handleNewMessage}
            formField="Message"
            buttonText="Send"
          />
        </Container>
      ) : (
        <SingleFieldForm
          fullWidth
          getFormValues={(vals) => setUserName(vals.Username)}
          formField="Username"
          buttonText="Chat"
        />
      )}
    </div>
  );
}

export default App;
