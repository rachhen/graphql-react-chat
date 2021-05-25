import { useEffect, useState, Fragment } from 'react';
import { Col, Form } from 'react-bootstrap';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useMessageDispatch, useMessageState } from '../../context/message';
import Message from './Message';

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      content
      to
      from
      createdAt
      reactions {
        uuid
        content
      }
    }
  }
`;

export default function Messages() {
  const dispatch = useMessageDispatch();
  const { users } = useMessageState();
  const [content, setContent] = useState();
  const [getMessages, { data: messagesData, loading }] =
    useLazyQuery(GET_MESSAGES);

  const selectedUser = users && users?.find((u) => u.selected);
  const messages = selectedUser?.messages;

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setContent('');
    },
    onError: (err) => console.log(err),
  });

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } });
    }
  }, [getMessages, selectedUser]);

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: 'SET_USER_MESSAGES',
        payload: {
          username: selectedUser.username,
          messages: messagesData.getMessages,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesData]);

  const submitMessage = (e) => {
    e.preventDefault();
    if (content.trim() === '' || !selectedUser) {
      return false;
    }
    sendMessage({ variables: { to: selectedUser.username, content } });
  };

  let selectedChatMarkup;
  if (!messages && !loading) {
    selectedChatMarkup = <p className="info-text">Select a friend</p>;
  } else if (loading) {
    selectedChatMarkup = <p className="info-text">Loading....</p>;
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={message.uuid}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </Fragment>
    ));
  } else if (messages.length === 0) {
    selectedChatMarkup = (
      <p className="info-text">
        You are now connected! send your first message!
      </p>
    );
  }

  return (
    <Col xs={10} md={8} className="p-0">
      <div className="messages-box d-flex flex-column-reverse p-3">
        {selectedChatMarkup}
      </div>
      <div className="px-3 py-2">
        <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex align-items-center m-0">
            <Form.Control
              type="text"
              value={content}
              placeholder="Type a message..."
              className="message-input p-4 rounded-pill bg-secondary border-0"
              onChange={(e) => setContent(e.target.value)}
            />
            <i
              className="fas fa-paper-plane fa-2x ml-2 text-primary"
              onClick={submitMessage}
              role="button"
            ></i>
          </Form.Group>
        </Form>
      </div>
    </Col>
  );
}
