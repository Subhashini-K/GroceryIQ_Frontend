export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Check if it's an Axios error response
  if (error.response && error.response.data) {
    const data = error.response.data;
    
    // Express validator array format
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(err => err.msg || err.message || err).join(', ');
    }
    
    // Standard error message format
    if (data.message) {
      return data.message;
    }
    
    // Fallback error string
    if (data.error) {
      return data.error;
    }
  }
  
  // Network errors or generic JavaScript errors
  return error.message || 'Network Error. Please try again.';
};
