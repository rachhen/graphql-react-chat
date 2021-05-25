import { Fragment, useEffect } from 'react';
import { Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { gql, useSubscription } from '@apollo/client';
import { useAuthDispatch, useAuthState } from '../../context/auth';
import { useMessageDispatch } from '../../context/message';
import Users from './Users';
import Messages from './Messages';

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const NEW_REACTION = gql`
  subscription newReaction {
    newReaction {
      content
      createdAt
      uuid
      message {
        uuid
        from
        to
      }
    }
  }
`;

function Home({ history }) {
  const authDispatch = useAuthDispatch();
  const messageDispatch = useMessageDispatch();
  const { user } = useAuthState();
  const { data: messageData, error: messageError } =
    useSubscription(NEW_MESSAGE);

  const { data: reactionData, error: reactionError } =
    useSubscription(NEW_REACTION);

  const logout = () => {
    authDispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  };

  useEffect(() => {
    if (messageError) console.log(messageError);

    if (messageData) {
      const message = messageData.newMessage;
      const otherUser =
        user.username === message.to ? message.from : message.to;
      messageDispatch({
        type: 'ADD_MESSAGE',
        payload: { username: otherUser, message },
      });
    }
  }, [messageData, messageDispatch, messageError, user.username]);

  useEffect(() => {
    if (reactionError) console.log(reactionError);

    if (reactionData) {
      const reaction = reactionData.newReaction;
      const otherUser =
        user.username === reaction.message.to
          ? reaction.message.from
          : reaction.message.to;

      messageDispatch({
        type: 'ADD_REACTION',
        payload: { username: otherUser, reaction },
      });
    }
  }, [messageDispatch, reactionData, reactionError, user.username]);

  return (
    <Fragment>
      <Row className="bg-white justify-content-around">
        <Link to="/login">
          <Button variant="link">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="link">Register</Button>
        </Link>
        <Button variant="link" onClick={logout}>
          Logout
        </Button>
      </Row>
      <Row className="bg-white mt-2">
        <Users />
        <Messages />
      </Row>
    </Fragment>
  );
}

export default Home;
