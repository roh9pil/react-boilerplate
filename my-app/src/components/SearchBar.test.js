import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

test('renders an input field', () => {
  const { getByPlaceholderText } = render(<SearchBar />);
  const inputElement = getByPlaceholderText(/search for images/i);
  expect(inputElement).toBeInTheDocument();
});

test('calls onSubmit when the form is submitted', () => {
  const handleSubmit = jest.fn();
  const { getByPlaceholderText, container } = render(<SearchBar onSubmit={handleSubmit} />);
  const inputElement = getByPlaceholderText(/search for images/i);
  const form = container.querySelector('form');

  fireEvent.change(inputElement, { target: { value: 'cats' } });
  fireEvent.submit(form);

  expect(handleSubmit).toHaveBeenCalledWith('cats');
});
