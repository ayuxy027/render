/**
 * Reads a file and returns its contents as a base64 string
 * @param file File to read
 * @returns Promise resolving to a base64 string
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // The result is a string with format: "data:application/pdf;base64,JVBERi0xLjMK..."
      // We need to strip the prefix "data:application/pdf;base64," to get just the base64 string
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Extracts text content from a file
 * @param file File to extract text from
 * @returns Promise resolving to text content
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  // This is a placeholder. In a real app, you might want to use libraries like pdf.js for PDFs,
  // or document parsers for other formats.
  // For now, we'll just return a message
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        // For text files, this will work directly
        resolve(reader.result as string);
      } catch (error) {
        reject(new Error('Failed to extract text from file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // For text files only
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      // For other files, we'd need proper parsers
      // This is just a simple implementation
      resolve(`Content of ${file.name} (${file.type})`);
    }
  });
}; 