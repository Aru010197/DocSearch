import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';

/**
 * Extract text content from a PDF file
 */
export async function extractPdfText(buffer: Buffer): Promise<{ text: string; metadata: any }> {
  try {
    const data = await pdfParse(buffer);
    
    return {
      text: data.text || '',
      metadata: {
        title: data.info?.Title || null,
        author: data.info?.Author || null,
        creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate).toISOString() : null,
        pageCount: data.numpages || 0,
      }
    };
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return { text: '', metadata: {} };
  }
}

/**
 * Extract text content from a DOCX file
 */
export async function extractDocxText(buffer: Buffer): Promise<{ text: string; metadata: any }> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    // Mammoth doesn't extract metadata, so we return just the text
    return {
      text: result.value || '',
      metadata: {}
    };
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    return { text: '', metadata: {} };
  }
}

/**
 * Extract text content from an XLSX file
 */
export async function extractXlsxText(buffer: Buffer): Promise<{ text: string; metadata: any }> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    let text = '';
    let sheetCount = 0;
    
    // Extract text from each worksheet
    workbook.eachSheet((worksheet) => {
      sheetCount++;
      text += `Sheet: ${worksheet.name}\n`;
      
      worksheet.eachRow((row) => {
        const rowText = row.values
          .filter(Boolean)
          .slice(1) // Remove the first undefined value
          .join(' ');
        
        if (rowText) {
          text += `${rowText}\n`;
        }
      });
      
      text += '\n';
    });
    
    return {
      text,
      metadata: {
        sheetCount,
        author: workbook.creator || null,
        creationDate: workbook.created ? new Date(workbook.created).toISOString() : null,
      }
    };
  } catch (error) {
    console.error('Error extracting XLSX text:', error);
    return { text: '', metadata: {} };
  }
}

/**
 * Extract text content from a PPTX file
 * Note: This is a placeholder. For actual PPTX parsing, you would need a library like pptx-parser
 */
export async function extractPptxText(buffer: Buffer): Promise<{ text: string; metadata: any }> {
  // This is a placeholder. In a real implementation, you would use a library to parse PPTX files
  return {
    text: 'PPTX text extraction not implemented',
    metadata: {}
  };
}

/**
 * Process a document based on its file type
 */
export async function processDocument(buffer: Buffer, fileType: string): Promise<{ text: string; metadata: any }> {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return extractPdfText(buffer);
    case 'docx':
      return extractDocxText(buffer);
    case 'xlsx':
      return extractXlsxText(buffer);
    case 'pptx':
      return extractPptxText(buffer);
    default:
      console.error(`Unsupported file type: ${fileType}`);
      return { text: '', metadata: {} };
  }
}
