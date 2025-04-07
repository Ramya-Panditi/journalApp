import { render, screen,fireEvent,waitFor } from '@testing-library/react';
import Bottom from './Bottom';
import { useTasks, useAddNote, useDeleteNote, useUpdateNote } from '../hooks/query';

// Mock the custom hooks used in the Bottom component
jest.mock('../hooks/query', () => ({
  useTasks: jest.fn(),
  useAddNote: jest.fn(),
  useDeleteNote: jest.fn(),
  useUpdateNote: jest.fn(),
}));

describe('Bottom Component', () => {
  
  beforeEach(() => {
    // Reset the mocks before each test
    jest.resetAllMocks();
  });

  it('displays loading message when tasks are loading', () => {
    // Mocking the useTasks hook to simulate loading state
    (useTasks as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      refetch: jest.fn(),
    });

    // Mock the other hooks to return valid objects (you can return empty functions or mock implementations here)
    (useAddNote as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    });
    (useDeleteNote as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    });
    (useUpdateNote as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    });

    render(<Bottom />);

    // Check if the loading message is displayed
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });
  it('adds a new note when input is provided', async () => {
    // Mocking the useTasks hook to simulate no loading state
    const refetchMock = jest.fn();
    (useTasks as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      refetch: refetchMock, // Mock the refetch function here
    });

    // Mocking the useAddNote hook
    const addNoteMock = jest.fn();
    (useAddNote as jest.Mock).mockReturnValue({
      mutate: addNoteMock,
      error: null,
    });

    // Mocking the useDeleteNote hook
    (useDeleteNote as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    });

    // Mocking the useUpdateNote hook
    (useUpdateNote as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    });

    // Render the Bottom component
    render(<Bottom />);

    // Find the input element and simulate typing a note
    const inputElement = screen.getByPlaceholderText('Title: Description') as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: 'Test Note:This is a test description' } });

    // Find the add button (the plus icon with role="button") and click it
    const addButton = screen.getByRole('button');
    fireEvent.click(addButton);

    // Simulate the onSuccess callback to trigger refetch
    await waitFor(() => {
      // Simulate successful mutation
      expect(addNoteMock).toHaveBeenCalledWith(
        {
          title: 'Test Note',
          description: 'This is a test description'
***REMOVED***
        expect.objectContaining({
          onSuccess: expect.any(Function) // Check if onSuccess is passed
***REMOVED***)
      );

      // Trigger the onSuccess callback manually
      const onSuccessCallback = addNoteMock.mock.calls[0][1].onSuccess;
      onSuccessCallback(); // Call the onSuccess callback

      // Check if refetch was called after adding the note
      expect(refetchMock).toHaveBeenCalled();
    });
  });
  it('deletes a note when the delete button is clicked', async () => {
    // Mocking the useTasks hook to simulate no loading state
    const refetchMock = jest.fn();
    (useTasks as jest.Mock).mockReturnValue({
      data: [
        { id: '1', title: 'Test Note 1', description: 'Description 1' },
        { id: '2', title: 'Test Note 2', description: 'Description 2' },
      ],
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });
  
    // Mocking the useDeleteNote hook
    const deleteNoteMock = jest.fn();
    (useDeleteNote as jest.Mock).mockReturnValue({
      mutate: deleteNoteMock,
      error: null,
    });
  
    // Mocking the other hooks (if needed)
    (useAddNote as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    });
    (useUpdateNote as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    });
  
    // Render the Bottom component
    render(<Bottom />);
    const deleteButton = screen
    .getByText('Test Note 2')
    .closest('div')?.querySelector('i[aria-label="Delete note"]'); // Using the aria-label for better targeting
  
    if (deleteButton) {
      fireEvent.click(deleteButton); // Simulate a click on the delete button
    } else {
      throw new Error('Delete button not found');
    }
  
    // Check if deleteNoteMock was called with the correct task ID
    await waitFor(() => {
      expect(deleteNoteMock).toHaveBeenCalledWith('2', expect.objectContaining({
        onSuccess: expect.any(Function), // Check if onSuccess callback exists
      }));
  
      // Trigger the onSuccess callback manually
      const onSuccessCallback = deleteNoteMock.mock.calls[0][1].onSuccess;
      onSuccessCallback(); // Simulate successful deletion
  
      // Check if refetch was called after deleting the note
      expect(refetchMock).toHaveBeenCalled();
    });
  });
  it('updates a note when the update button is clicked', async () => {
    // Mocking the useTasks hook to return some test data
    const refetchMock = jest.fn();
    const testData = [
      { id: '1', title: 'Test Note 1', description: 'Description 1' },
      { id: '2', title: 'Test Note 2', description: 'Description 2' },
    ];
    (useTasks as jest.Mock).mockReturnValue({
      data: testData,
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });
  
    // Mocking the mutate functions for the hooks
    const addNoteMock = jest.fn();
    const updateNoteMock = jest.fn();
    const deleteNoteMock = jest.fn();
  
    (useAddNote as jest.Mock).mockReturnValue({
      mutate: addNoteMock,
      error: null,
    });
    (useUpdateNote as jest.Mock).mockReturnValue({
      mutate: updateNoteMock,
      error: null,
    });
    (useDeleteNote as jest.Mock).mockReturnValue({
      mutate: deleteNoteMock,
      error: null,
    });
  
    // Render the Bottom component
    render(<Bottom />);
  
    // Find the edit (pencil) icon for the second task (Test Note 2)
    const editButton = screen.getAllByRole('button', { name: /edit/i })[0]; // Select the second "edit" button
    fireEvent.click(editButton);
  
    // Find the input field and change its value
    const inputField = screen.getByPlaceholderText('Title: Description');
    fireEvent.change(inputField, { target: { value: 'Updated Test Note:Updated Description' } });
  
    // Find and click the "Save" (plus) button to update the note
    const saveButton = screen.getByRole('button', { name: /add/i }); // The same button used for add/update
    fireEvent.click(saveButton);
  
    // Check if the update mutation was called with the correct data
    await waitFor(() => {
      // Ensure the correct id and updated description are passed
      expect(updateNoteMock).toHaveBeenCalledWith(
        {
          id: '2', // Ensure this matches the id of Test Note 2
          title: 'Updated Test Note',
          description: 'Updated Description', // Make sure no extra space is included
***REMOVED***
        expect.objectContaining({
          onSuccess: expect.any(Function), // Check if onSuccess callback exists
***REMOVED***)
      );
  
      // Simulate the onSuccess callback to trigger refetch
      const onSuccessCallback = updateNoteMock.mock.calls[0][1].onSuccess;
      onSuccessCallback(); // Simulate successful update
  
      // Ensure refetch was called after the update
      expect(refetchMock).toHaveBeenCalled();
    });
  });
 
});


