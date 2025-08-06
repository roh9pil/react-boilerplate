import React from 'react';
import styles from './ImageModal.module.css';

const ImageModal = ({ image, onClose }) => {
  if (!image) {
    return null;
  }

  const { urls, user, description, created_at, likes } = image;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <img src={urls.regular} alt={description || 'Image'} className={styles.modalImage} />
        <div className={styles.modalDetails}>
          {description && <p>{description}</p>}
          <p>By: {user.name}</p>
          <p>Published on: {new Date(created_at).toLocaleDateString()}</p>
          <p>Likes: {likes}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
