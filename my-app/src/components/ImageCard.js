import React from 'react';

const ImageCard = ({ image }) => {
  const { description, urls, user } = image;

  return (
    <div className="image-card">
      <img src={urls.regular} alt={description} />
      <div className="image-details">
        <p>{description}</p>
        <p>By: {user.name}</p>
      </div>
    </div>
  );
};

export default ImageCard;
