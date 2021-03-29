import React from 'react';
import { FacebookShareButton, FacebookIcon } from 'react-share';

const ShareButton = (props) => {
  return (
    <FacebookShareButton
      url={props.url}
      quote={'Tocame los nicalillos fuerte fuerte'}
      hashtag="#ypocomasthe cuento"
      className={props.socialMediaButton}
    >
      <FacebookIcon size={36} />
    </FacebookShareButton>
  );
};

export default ShareButton;
