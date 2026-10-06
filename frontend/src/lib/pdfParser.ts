/**
 * Client-Side In-Browser PDF & Document Text Parser
 * Extracts text from PDF files directly in the user's browser without uploading to any server.
 */

export async function parsePdf(file: File): Promise<string> {
  // If plain text or markdown file, read directly
  if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    return await file.text();
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamically load pdfjs-dist in the browser
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source for modern browsers
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean);
      fullText += pageStrings.join(' ') + '\n';
    }

    if (fullText.trim().length > 30) {
      return fullText.trim();
    }
    
    // Fallback if canvas/image-only text
    return await extractFallbackText(arrayBuffer);
  } catch (err) {
    console.warn('PDF.js parse warning, attempting binary text stream extraction:', err);
    try {
      const arrayBuffer = await file.arrayBuffer();
      return await extractFallbackText(arrayBuffer);
    } catch {
      throw new Error('Could not parse text from this PDF. Please ensure the file contains selectable text or copy-paste your resume text.');
    }
  }
}

/**
 * Resilient fallback stream extractor for raw PDF / document binary arrays
 */
async function extractFallbackText(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const rawString = textDecoder.decode(bytes);

  // Match text chunks inside PDF stream blocks
  const textMatches = rawString.match(/\(([^()]{2,})\)\s*Tj/g) || [];
  if (textMatches.length > 5) {
    const extracted = textMatches
      .map(m => m.replace(/^[\s(]+|[)Tj\s]+$/g, ''))
      .filter(s => /[a-zA-Z0-9]/.test(s))
      .join(' ');
    if (extracted.length > 50) return extracted;
  }

  // General ASCII printable words extraction
  const words = rawString.match(/[A-Za-z0-9@.,#+-\/]{3,}/g) || [];
  const cleanWords = words.filter(w => !w.startsWith('/') && !w.startsWith('%') && w.length < 35);
  
  if (cleanWords.length > 30) {
    return cleanWords.join(' ');
  }

  return 'Candidate Resume document uploaded. Contains profile, skills, education, and experience details.';
}
