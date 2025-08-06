import React from 'react';
import styles from './ImageCard.module.css';

const ImageCard = ({ image, onImageClick }) => {
  const { description, urls, user } = image;

  return (
    <div className={styles.imageCard} onClick={() => onImageClick(image)}>
      <img src={urls.regular} alt={description || 'Image'} />
      <div className={styles.imageDetails}>
        {description && <p>{description}</p>}
        <p>By: {user.name}</p>
      </div>
    </div>
  );
};

export default ImageCard;
