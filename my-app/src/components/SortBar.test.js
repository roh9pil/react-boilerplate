import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SortBar from './SortBar';

test('renders sort buttons and calls onSortChange on click', () => {
  const handleSortChange = jest.fn();
  render(<SortBar onSortChange={handleSortChange} currentSort="relevant" />);

  const relevantButton = screen.getByRole('button', { name: /relevant/i });
  const latestButton = screen.getByRole('button', { name: /latest/i });

  expect(relevantButton).toHaveClass('active');
  expect(latestButton).not.toHaveClass('active');

  fireEvent.click(latestButton);
  expect(handleSortChange).toHaveBeenCalledWith('latest');

  fireEvent.click(relevantButton);
  expect(handleSortChange).toHaveBeenCalledWith('relevant');
});
