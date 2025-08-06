import React from 'react';
import { render, fireEvent, waitFor, screen, within } from '@testing-library/react';
import App from './App';
import { searchImages } from './api/unsplash';

jest.mock('./api/unsplash', () => ({
  searchImages: jest.fn(),
}));

const mockImagesCatsPage1 = [
  { id: '1', description: 'cat 1', urls: { regular: 'cat1.jpg' }, user: { name: 'user1' }, created_at: '2022-01-01T12:00:00Z', likes: 10 },
  { id: '2', description: 'cat 2', urls: { regular: 'cat2.jpg' }, user: { name: 'user2' }, created_at: '2022-01-02T12:00:00Z', likes: 20 },
];

const mockImagesCatsPage2 = [
  { id: '3', description: 'cat 3', urls: { regular: 'cat3.jpg' }, user: { name: 'user3' }, created_at: '2022-01-03T12:00:00Z', likes: 30 },
];

const mockImagesDogs = [
  { id: '4', description: 'dog 1', urls: { regular: 'dog1.jpg' }, user: { name: 'user4' }, created_at: '2022-01-04T12:00:00Z', likes: 40 },
  { id: '5', description: 'dog 2', urls: { regular: 'dog2.jpg' }, user: { name: 'user5' }, created_at: '2022-01-05T12:00:00Z', likes: 50 },
];

beforeEach(() => {
  searchImages.mockClear();
});

test('renders initial images, loads more on button click, and handles a new search', async () => {
  // Initial load (cats page 1)
  searchImages.mockResolvedValueOnce(mockImagesCatsPage1);
  render(<App />);

  await waitFor(() => {
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', 'cat1.jpg');
  });
  expect(searchImages).toHaveBeenCalledWith('cats', 1, 'relevant');

  // Load more (cats page 2)
  searchImages.mockResolvedValueOnce(mockImagesCatsPage2);
  const loadMoreButton = screen.getByRole('button', { name: /load more/i });
  fireEvent.click(loadMoreButton);

  await waitFor(() => {
    expect(screen.getAllByRole('img')).toHaveLength(3); // 2 from page 1 + 1 from page 2
  });
  expect(searchImages).toHaveBeenCalledWith('cats', 2, 'relevant');

  // New search (dogs)
  searchImages.mockResolvedValueOnce(mockImagesDogs);
  const inputElement = screen.getByPlaceholderText(/search for images/i);
  fireEvent.change(inputElement, { target: { value: 'dogs' } });
  fireEvent.submit(inputElement.form);

  await waitFor(() => {
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', 'dog1.jpg');
  });
  expect(searchImages).toHaveBeenCalledWith('dogs', 1, 'relevant');
});

test('hides "Load More" button when there are no more images', async () => {
  searchImages.mockResolvedValueOnce(mockImagesCatsPage1);
  render(<App />);

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
  });

  // Return an empty array for the next page
  searchImages.mockResolvedValueOnce([]);
  const loadMoreButton = screen.getByRole('button', { name: /load more/i });
  fireEvent.click(loadMoreButton);

  await waitFor(() => {
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });
  expect(screen.getAllByRole('img')).toHaveLength(2); // Still the original 2
});

test('opens and closes the image modal', async () => {
  searchImages.mockResolvedValueOnce(mockImagesCatsPage1);
  render(<App />);

  await waitFor(() => {
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  // Open the modal
  const imageToClick = screen.getAllByRole('img')[0];
  fireEvent.click(imageToClick);

  await waitFor(() => {
    const modal = screen.getByRole('dialog');
    expect(within(modal).getByText(/by: user1/i)).toBeInTheDocument();
    expect(within(modal).getByText(/published on:/i)).toBeInTheDocument();
    expect(within(modal).getByText(/likes: 10/i)).toBeInTheDocument();
  });

  // Close the modal by clicking the close button
  const closeButton = screen.getByText('×');
  fireEvent.click(closeButton);

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('refetches images when sort order is changed', async () => {
  // Initial load (cats, relevant)
  searchImages.mockResolvedValueOnce(mockImagesCatsPage1);
  render(<App />);

  await waitFor(() => {
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });
  expect(searchImages).toHaveBeenCalledWith('cats', 1, 'relevant');

  // Change sort order to 'latest'
  const mockSortedImages = [
    { id: '10', description: 'latest cat 1', urls: { regular: 'latest_cat1.jpg' }, user: { name: 'user10' }, created_at: '2022-02-01T12:00:00Z', likes: 5 },
  ];
  searchImages.mockResolvedValueOnce(mockSortedImages);

  const latestButton = screen.getByRole('button', { name: /latest/i });
  fireEvent.click(latestButton);

  await waitFor(() => {
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', 'latest_cat1.jpg');
  });
  expect(searchImages).toHaveBeenCalledWith('cats', 1, 'latest');
});

