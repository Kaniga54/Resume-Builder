import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function parsePdf(pdfBuffer) {
  try {
    const data = await pdf(pdfBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file. Ensure the file is not corrupted or password-protected.');
  }
}
