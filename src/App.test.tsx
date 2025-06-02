import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login component', () => {
  render(<App />);
  const titleElement = screen.getByText(/Welcome to 安全檢查表/i);
  expect(titleElement).toBeInTheDocument();
});
