import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ImageModal from './ImageModal';

const mockImage = {
  id: '1',
  urls: {
    regular: 'https://example.com/image.jpg',
  },
  user: {
    name: 'John Doe',
  },
  description: 'A beautiful landscape',
  created_at: '2022-01-01T12:00:00Z',
  likes: 100,
};

test('renders nothing when no image is provided', () => {
  const { container } = render(<ImageModal image={null} />);
  expect(container.firstChild).toBeNull();
});

test('renders the modal with image details when an image is provided', () => {
  const { getByAltText, getByText } = render(<ImageModal image={mockImage} />);

  const imageElement = getByAltText(/a beautiful landscape/i);
  expect(imageElement).toBeInTheDocument();
  expect(imageElement.src).toBe('https://example.com/image.jpg');

  const userElement = getByText(/by: john doe/i);
  expect(userElement).toBeInTheDocument();

  const dateElement = getByText(/published on:/i);
  expect(dateElement).toBeInTheDocument();

  const likesElement = getByText(/likes: 100/i);
  expect(likesElement).toBeInTheDocument();
});

test('calls onClose when the overlay is clicked', () => {
  const handleClose = jest.fn();
  const { container } = render(<ImageModal image={mockImage} onClose={handleClose} />);
  const overlay = container.querySelector('.modalOverlay');

  fireEvent.click(overlay);

  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('calls onClose when the close button is clicked', () => {
  const handleClose = jest.fn();
  const { getByText } = render(<ImageModal image={mockImage} onClose={handleClose} />);
  const closeButton = getByText('×');

  fireEvent.click(closeButton);

  expect(handleClose).toHaveBeenCalledTimes(1);
});
