import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import { gql, useMutation } from '@apollo/client';

import { useAuthState } from '../../context/auth';

const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎'];

const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($uuid: String!, $content: String!) {
    reactToMessage(uuid: $uuid, content: $content) {
      uuid
    }
  }
`;

function Message({ message }) {
  const { user } = useAuthState();
  const [showPopover, setShowPopover] = useState(false);
  const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
    onError: (err) => console.log(err),
    onCompleted: (data) => setShowPopover(false),
  });

  const sent = message.from === user.username;
  const received = !sent;
  const reactionIcons = [...new Set(message.reactions.map((r) => r.content))];

  const react = (reaction) => {
    reactToMessage({ variables: { uuid: message.uuid, content: reaction } });
  };

  const reactButton = (
    <OverlayTrigger
      trigger="click"
      placement="top"
      show={showPopover}
      onToggle={setShowPopover}
      transition={false}
      rootClose
      overlay={
        <Popover className="rounded-pill">
          <Popover.Content className="d-flex px-0 py-1 align-items-center react-btn-popover">
            {reactions.map((reaction) => (
              <Button
                key={reaction}
                variant="link"
                className="react-icon-btn"
                onClick={() => react(reaction)}
              >
                {reaction}
              </Button>
            ))}
          </Popover.Content>
        </Popover>
      }
    >
      <Button variant="link" className="px-2">
        <i className="far fa-smile"></i>
      </Button>
    </OverlayTrigger>
  );

  return (
    <div
      className={classNames('d-flex my-3', {
        'ml-auto': sent,
        'mr-auto': received,
      })}
    >
      {sent && reactButton}
      <OverlayTrigger
        placement={sent ? 'left' : 'right'}
        overlay={
          <Tooltip>
            {moment(message.createdAt).format('MMMM DD, YYYY @ h:mm a')}
          </Tooltip>
        }
        transition={false}
      >
        <div
          className={classNames('py-2 px-2 rounded-pill position-relative', {
            'bg-primary': sent,
            'bg-secondary': received,
          })}
        >
          {message.reactions.length > 0 && (
            <div className="reaction-div bg-secondary p-1 rounded-pill">
              {reactionIcons} {message.reactions.length}
            </div>
          )}
          <p className={classNames({ 'text-white': sent })}>
            {message.content}
          </p>
        </div>
      </OverlayTrigger>
      {received && reactButton}
    </div>
  );
}

export default Message;
