import React from 'react';
import { render } from '@testing-library/react';
import ImageCard from './ImageCard';

const mockImage = {
  description: 'A beautiful landscape',
  urls: {
    regular: 'https://example.com/image.jpg',
  },
  user: {
    name: 'John Doe',
  },
};

test('renders the image and user name', () => {
  const { getByAltText, getByText } = render(<ImageCard image={mockImage} />);
  
  const imageElement = getByAltText(/a beautiful landscape/i);
  expect(imageElement).toBeInTheDocument();
  expect(imageElement.src).toBe('https://example.com/image.jpg');

  const userElement = getByText(/by: john doe/i);
  expect(userElement).toBeInTheDocument();
});
