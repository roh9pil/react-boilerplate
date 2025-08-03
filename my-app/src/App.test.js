import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { searchImages } from './api/unsplash';

jest.mock('./api/unsplash', () => ({
  searchImages: jest.fn(),
}));

const mockImages = [
  { id: '1', description: 'cat 1', urls: { regular: 'cat1.jpg' }, user: { name: 'user1' } },
  { id: '2', description: 'cat 2', urls: { regular: 'cat2.jpg' }, user: { name: 'user2' } },
];

test('renders the search bar and displays images after search', async () => {
  searchImages.mockResolvedValue(mockImages);

  const { getByPlaceholderText, getAllByRole } = render(<App />);

  const inputElement = getByPlaceholderText(/search for images/i);
  fireEvent.change(inputElement, { target: { value: 'cats' } });
  fireEvent.submit(inputElement.form);

  await waitFor(() => {
    const images = getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'cat1.jpg');
    expect(images[1]).toHaveAttribute('src', 'cat2.jpg');
  });
});
