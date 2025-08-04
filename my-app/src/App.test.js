import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { searchImages } from './api/unsplash';

jest.mock('./api/unsplash', () => ({
  searchImages: jest.fn(),
}));

const mockImagesCats = [
  { id: '1', description: 'cat 1', urls: { regular: 'cat1.jpg' }, user: { name: 'user1' } },
  { id: '2', description: 'cat 2', urls: { regular: 'cat2.jpg' }, user: { name: 'user2' } },
];

const mockImagesDogs = [
  { id: '3', description: 'dog 1', urls: { regular: 'dog1.jpg' }, user: { name: 'user3' } },
  { id: '4', description: 'dog 2', urls: { regular: 'dog2.jpg' }, user: { name: 'user4' } },
];

test('renders the search bar, displays initial images, and displays new images after search', async () => {
  searchImages.mockResolvedValue(mockImagesCats);

  const { getByPlaceholderText, getAllByRole } = render(<App />);

  // Wait for initial images
  await waitFor(() => {
    const images = getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'cat1.jpg');
  });

  // Mock for the next search
  searchImages.mockResolvedValue(mockImagesDogs);

  const inputElement = getByPlaceholderText(/search for images/i);
  fireEvent.change(inputElement, { target: { value: 'dogs' } });
  fireEvent.submit(inputElement.form);

  await waitFor(() => {
    const images = getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'dog1.jpg');
  });
});
