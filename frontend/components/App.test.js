// Write your tests here
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Ensure this is imported
import axios from 'axios';
import AppFunctional from './AppFunctional';

// Mock axios
jest.mock('axios');

beforeEach(() => {
  axios.post.mockClear(); // Reset mocks before each test
});

test('submits form and updates message on success', async () => {
  // Mock API response
  axios.post.mockResolvedValueOnce({
    data: { message: 'lady win #31' },
  });

  // Render the component
  render(<AppFunctional />);

  // Simulate user input
  fireEvent.change(screen.getByPlaceholderText('type email'), {
    target: { value: 'valid@example.com' },
  });

  fireEvent.click(screen.getByText('submit'));

  // Wait for API call and assert the message update
  await waitFor(() => {
    expect(screen.getByText('lady win #31')).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith('http://localhost:9000/api/result', {
      x: 2, // initial index 4 => (4 % 3) +1 = 2, Math.floor(4 / 3) +1 = 2
      y: 2,
      steps: 0,
      email: 'lady@gaga.com',
    });
    
  });

  // Check if the email input is reset
  expect(screen.getByPlaceholderText(/type email/i).value).toBe('');
});

test('displays all headings, buttons, and form elements', () => {
  render(<AppFunctional />);

  // Check headings
  expect(screen.getByText(/Coordinates/i)).toBeInTheDocument();
  expect(screen.getByText(/You moved/i)).toBeInTheDocument();

  // Check buttons
  expect(screen.getByText(/LEFT/i)).toBeInTheDocument();
  expect(screen.getByText(/UP/i)).toBeInTheDocument();
  expect(screen.getByText(/RIGHT/i)).toBeInTheDocument();
  expect(screen.getByText(/DOWN/i)).toBeInTheDocument();
  expect(screen.getByText(/reset/i)).toBeInTheDocument();

  // Check form elements
  expect(screen.getByPlaceholderText(/type email/i)).toBeInTheDocument();
  expect(screen.getByText(/submit/i)).toBeInTheDocument();
});

test('typing on the email input changes its value', () => {
  render(<AppFunctional />);

  const emailInput = screen.getByPlaceholderText(/type email/i);
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

  expect(emailInput.value).toBe('test@example.com');
});

test('reset button resets the states to their initial values', () => {
  render(<AppFunctional />);

  // Perform some actions to change state
  fireEvent.click(screen.getByText(/RIGHT/i)); // Move right
  fireEvent.click(screen.getByText(/reset/i)); // Reset

  expect(screen.getByText(/Coordinates \(2, 2\)/i)).toBeInTheDocument();
  expect(screen.getByText(/You moved 0 times/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/type email/i).value).toBe('');
});

test('displays error when attempting invalid move', () => {
  render(<AppFunctional />);

  // Attempt an invalid move
  fireEvent.click(screen.getByText(/UP/i)); // Move up to index 1
  fireEvent.click(screen.getByText(/UP/i)); // Attempt to move up beyond the top edge

  expect(screen.getByText(/You can't go up/i)).toBeInTheDocument();
});

test('sanity', () => {
  expect(true).toBe(true);
});
