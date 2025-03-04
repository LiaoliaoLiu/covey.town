import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import TextConversation, { ChatMessage, MessageBodyType, MessageType } from '../../../../../../classes/TextConversation';
import clsx from 'clsx';
import { isMobile } from '../../../utils';
import Snackbar from '../../Snackbar/Snackbar';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import useMaybeVideo from '../../../../../../hooks/useMaybeVideo';
import SendingOptions from '../SendingOptions/SendingOptions';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';
import { Box, Flex, Spacer } from '@chakra-ui/react';
import ImageUpload from '../ImageUpload/ImageUpload';
import FileUpload from '../FileUpload/FileUpload';
import TextInputToggleButton from './TextInputToggleButton';

const useStyles = makeStyles(theme => ({
  chatInputContainer: {
    borderTop: '1px solid #e4e7e9',
    borderBottom: '1px solid #e4e7e9',
    padding: '1em 1.2em 1em',
  },
  textArea: {
    width: '100%',
    border: '0',
    resize: 'none',
    fontSize: '14px',
    fontFamily: 'Inter',
    outline: 'none',
  },
  button: {
    padding: '0.56em',
    minWidth: 'auto',
    '&:disabled': {
      background: 'none',
      '& path': {
        fill: '#d8d8d8',
      },
    },
  },
  buttonContainer: {
    margin: '1em 0 0 1em',
    display: 'flex',
  },
  fileButtonContainer: {
    position: 'relative',
    marginRight: '1em',
  },
  fileButtonLoadingSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  textAreaContainer: {
    display: 'flex',
    marginTop: '0.4em',
    padding: '0.48em 0.7em',
    border: '2px solid transparent',
  },
  isTextareaFocused: {
    borderColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
}));

interface ChatInputProps {
  conversation: TextConversation;
  isChatWindowOpen: boolean;
}

const ALLOWED_FILE_TYPES =
  'audio/*, image/*, text/*, video/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document .xslx, .ppt, .pdf, .key, .svg, .csv';

export default function ChatInput({ conversation, isChatWindowOpen }: ChatInputProps) {
  const classes = useStyles();
  const [messageBody, setMessageBody] = useState('');
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [fileSendError, setFileSendError] = useState<string | null>(null);
  const isValidMessage = /\S/.test(messageBody);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const video = useMaybeVideo()
  const [messageType, setMessageType] = useState<MessageType>(MessageType.GLOBAL_MESSAGE)
  const [receiverId, setReceiverId] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const playerId = useCoveyAppState().myPlayerID
  const [isInputUrl, setIsInputUrl] = useState(false)

  useEffect(() => {
    if (isTextareaFocused) {
      video?.pauseGame();
    } else {
      video?.unPauseGame();
    }
  }, [isTextareaFocused, video]);
  useEffect(() => {
    if (isChatWindowOpen) {
      // When the chat window is opened, we will focus on the text input.
      // This is so the user doesn't have to click on it to begin typing a message.
      textInputRef.current?.focus();
    }
  }, [isChatWindowOpen]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageBody(event.target.value);
  };

  // ensures pressing enter + shift creates a new line, so that enter on its own only sends the message:
  const handleReturnKeyPress = (event: React.KeyboardEvent) => {
    if (!isMobile && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(messageBody);
    }
  };

  const handleSendMessage = (message: string) => {
    if (isValidMessage) {
      message = message.trim()
      conversation.sendMessage(message, messageType, playerId, receiverName, receiverId, 
        isInputUrl ? MessageBodyType.URL : MessageBodyType.TEXT);
      setMessageBody('');
    }
  };

  const handleFileMessage = (message: string, bodyType: MessageBodyType) => {
    console.log(bodyType)
      conversation.sendMessage(message, messageType, playerId, receiverName, receiverId, bodyType);
      setMessageBody('');
  }

  return (
    <div className={classes.chatInputContainer}>
        <SendingOptions
          messageType={messageType}
          setMessageType={setMessageType}
          receiverId={receiverId}
          setReceiverId={setReceiverId}
          setReceiverName={setReceiverName}
        />
        {/* <Snackbar
          open={Boolean(fileSendError)}
          headline="Error"
          message={fileSendError || ''}
          variant="error"
          handleClose={() => setFileSendError(null)}
        /> */}
      <Flex>
          <ImageUpload onChange={handleFileMessage}/> 
        <Spacer/>
          <FileUpload onChange={handleFileMessage}/> 
        <Spacer/>
          <TextInputToggleButton isInputUrl={isInputUrl} setIsInputUrl={setIsInputUrl} />
      </Flex>
      <div className={clsx(classes.textAreaContainer, { [classes.isTextareaFocused]: isTextareaFocused })}>
        {/* 
        Here we add the "isTextareaFocused" class when the user is focused on the TextareaAutosize component.
        This helps to ensure a consistent appearance across all browsers. Adding padding to the TextareaAutosize
        component does not work well in Firefox. See: https://github.com/twilio/twilio-video-app-react/issues/498
        */}
        <TextareaAutosize
          minRows={1}
          maxRows={3}
          className={classes.textArea}
          aria-label="chat input"
          placeholder={isInputUrl ? "Try a URL...(e.g. YouTube)" : "Write a message..."}
          onKeyPress={handleReturnKeyPress}
          onChange={handleChange}
          value={messageBody}
          data-cy-chat-input
          ref={textInputRef}
          onFocus={() => setIsTextareaFocused(true)}
          onBlur={() => setIsTextareaFocused(false)}
        />
      </div>
    </div>
  );
}
