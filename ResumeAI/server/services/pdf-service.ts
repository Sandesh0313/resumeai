import pdf from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer, {
      // Using default options
      pagerender: renderPage
    });

    // Return the extracted text
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

// Custom render function to improve text extraction
function renderPage(pageData: any) {
  // Check if we have a text content
  if (!pageData.getTextContent) {
    return Promise.resolve('');
  }

  return pageData.getTextContent({
    // These options attempt to normalize line breaks and spaces
    normalizeWhitespace: true,
    disableCombineTextItems: false
  }).then(function(textContent: any) {
    let lastY, text = '';
    for (let item of textContent.items) {
      if (lastY == item.transform[5] || !lastY) {
        text += item.str;
      } else {
        text += '\n' + item.str;
      }
      lastY = item.transform[5];
    }
    return text;
  });
}
