import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as xlsx from 'xlsx';

// Set worker source for pdf.js. This is crucial for it to work in a browser environment.
// Using unpkg CDN for reliability.
GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

const readAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

const parsePdf = async (data: ArrayBuffer): Promise<string | { mimeType: string; data: string }[]> => {
    const loadingTask = getDocument({ data });
    const pdf = await loadingTask.promise;
    let text = '';

    // First, try to extract text content
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // `content.items` contains objects that are either TextItem or TextMarkedContent from pdf.js.
        // We need to check for the existence of the `str` property to identify TextItems.
        // The original code had a type predicate that was causing errors due to a mismatched local `TextItem` type.
        // This `reduce` approach correctly narrows the type and extracts the text without type errors.
        const strings = content.items.reduce<string[]>((acc, item) => {
            if ('str' in item) {
                acc.push(item.str);
            }
            return acc;
        }, []);
        
        text += strings.join(' ') + '\n\n';
    }

    // If text is minimal, attempt image-based OCR fallback.
    // A threshold of 100 chars is a heuristic for a document being image-based.
    if (text.trim().length < 100 && pdf.numPages > 0) {
        console.log("Minimal text found in PDF, attempting image-based extraction for OCR.");
        const imageParts: { mimeType: string; data: string }[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            // Higher scale improves OCR quality
            const viewport = page.getViewport({ scale: 2.0 }); 
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (!context) {
                console.warn(`Could not get canvas context for page ${i + 1}`);
                continue;
            }

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
            imageParts.push({
                mimeType: 'image/jpeg',
                data: base64Data,
            });
        }
        
        if (imageParts.length > 0) {
            return imageParts;
        }
    }
    
    if (!text.trim()) {
        throw new Error("Could not extract text from the PDF. The document might be image-based or contain no text.");
    }
    return text;
};


const parseDocx = async (data: ArrayBuffer): Promise<string> => {
    const result = await mammoth.extractRawText({ arrayBuffer: data });
    return result.value;
};

const parseXlsx = async (data: ArrayBuffer): Promise<string> => {
    const workbook = xlsx.read(data, { type: 'array' });
    let text = '';
    workbook.SheetNames.forEach(sheetName => {
        text += `Sheet: ${sheetName}\n\n`;
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        jsonData.forEach(row => {
            text += row.join(', ') + '\n';
        });
        text += '\n---\n\n'; // Separator between sheets
    });
    return text;
};

export const extractTextFromFile = async (file: File): Promise<string | { mimeType: string; data: string }[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['txt', 'md', 'text/plain'].includes(extension || '')) {
        return readAsText(file);
    }

    const arrayBuffer = await readAsArrayBuffer(file);

    switch (extension) {
        case 'pdf':
            return parsePdf(arrayBuffer);
        case 'docx':
            return parseDocx(arrayBuffer);
        case 'xlsx':
        case 'xls':
            return parseXlsx(arrayBuffer);
        case 'doc':
             throw new Error('.doc files are not supported. Please save as .docx and try again.');
        default:
            // Attempt to read as text as a fallback for unknown text-based formats
            try {
                return await readAsText(file);
            } catch (e) {
                 throw new Error(`Unsupported file type: .${extension}. Please use .txt, .md, .pdf, .docx, or .xlsx.`);
            }
    }
};