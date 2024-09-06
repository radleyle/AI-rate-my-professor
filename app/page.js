'use client'
import { Box, Button, Stack, TextField, Typography, useTheme, useMediaQuery } from '@mui/material'
import { useState } from 'react'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';


import ReactMarkdown from 'react-markdown'

// Chat container styling
const ChatContainer = (props) => (
  <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    bgcolor="#F0F2F5" 
    p={2}
    {...props}
  />
);

// Chat box styling
const ChatBox = (props) => (
  <Stack
    direction="column"
    width="100%"
    maxWidth="600px"
    height="80%"
    borderRadius={2}
    boxShadow={3}
    p={2}
    spacing={3}
    bgcolor="#FFFFFF"
    {...props}
  />
);

// Message styling
const MessageBubble = ({ role, content, isMobile }) => (
  <Box
    display="flex"
    justifyContent={role === 'assistant' ? 'flex-start' : 'flex-end'}
    mb={1}
  >
    <Box
      bgcolor={role === 'assistant' ? '#E0E0E0' : '#007bff'}
      color={role === 'assistant' ? '#000' : '#fff'}
      borderRadius={20}
      p={2}
      maxWidth={isMobile ? '90%' : '50%'}
      sx={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  </Box>
);

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        return [
          ...prevMessages.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + result },
        ];
      });
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <ChatContainer>
      <ChatBox>
      <Typography 
      align="center" 
      color="textPrimary" 
      style={{ fontSize: '24px', fontFamily: 'Roboto Mono', letterSpacing: '-0.5px', lineHeight: '32px' }}
      gutterBottom
    >
      <ChatBubbleIcon fontSize="small" /> Rate My Professor AI
    </Typography>
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              boxShadow: `inset 0 0 6px ${theme.palette.divider}`,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: '10px',
            },
          }}
        >
          {messages.map((msg, index) => (
            <MessageBubble key={index} role={msg.role} content={msg.content} isMobile={isMobile} />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Message"
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{ flexShrink: 0 }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </ChatBox>
    </ChatContainer>
  );
}


// test commit hi world 