import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * 將 HTML 元素導出為 PDF 檔案
 * @param element 要導出的 HTML 元素
 * @param fileName PDF 檔案名稱
 * @param options 配置選項
 */
interface ExportOptions {
  hideElements?: NodeListOf<Element> | Element[];
  scale?: number;
  margin?: number; // in mm
  pageFormat?: 'a4' | 'letter' | string; // Allow custom strings, default to common
  orientation?: 'p' | 'portrait' | 'l' | 'landscape';
  enforcedWidth?: number; // The width (in px) to force the element to for rendering
}

export const exportElementToPDF = async (
  element: HTMLElement,
  fileName: string,
  options: ExportOptions = {}
) => {
  if (!element) {
    console.error('找不到要導出的元素');
    return;
  }

  const {
    hideElements,
    scale = 2, // Default scale
    margin = 10, // Default margin in mm
    pageFormat = 'a4',
    orientation = 'p',
    enforcedWidth, // New option
  } = options;

  // 保存原始顯示狀態
  const hiddenElementDetails: { element: HTMLElement; originalDisplay: string }[] = [];
  if (hideElements) {
    Array.from(hideElements).forEach(el => {
      const htmlEl = el as HTMLElement;
      hiddenElementDetails.push({ element: htmlEl, originalDisplay: htmlEl.style.display });
      htmlEl.style.display = 'none'; // Hide before capture
    });
  }

  const tempId = 'pdf-export-target-' + Date.now(); // More unique ID for onclone

  try {
    // Original element is 'element'
    if (enforcedWidth) {
      element.setAttribute('data-pdf-export-temp-id', tempId); // Apply to original element
    }

    const canvas = await html2canvas(element, { // Pass original element
      scale: scale,
      useCORS: true,
      logging: process.env.NODE_ENV === 'development', // Log only in dev
      onclone: (documentClone) => {
        if (enforcedWidth) {
          const clonedElement = documentClone.querySelector(`[data-pdf-export-temp-id="${tempId}"]`) as HTMLElement | null;
          if (clonedElement) {
            clonedElement.style.width = `${enforcedWidth}px`;
            clonedElement.style.maxWidth = `${enforcedWidth}px`;
            clonedElement.style.minWidth = `${enforcedWidth}px`;
            // Content within the clonedElement should reflow based on its own CSS (flex, percentages etc.)
          }
        }
      },
    });

    if (enforcedWidth) {
      element.removeAttribute('data-pdf-export-temp-id'); // Clean up from original element
    }

    const pdf = new jsPDF({
      orientation: orientation.charAt(0) as 'p' | 'l',
      unit: 'mm',
      format: pageFormat as string, // Cast as string if pageFormat can be custom
    });

    const marginMM = margin; // Margin in mm
    const pageWidth = pdf.internal.pageSize.getWidth(); // in mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // in mm

    // Content area dimensions in mm on PDF page
    const contentWidthMM = pageWidth - marginMM * 2;
    const contentHeightMM = pageHeight - marginMM * 2;

    const canvasPixelWidth = canvas.width; // Pixel width of the full source canvas
    const canvasPixelHeight = canvas.height; // Pixel height of the full source canvas

    // Calculate the width the canvas image will take on the PDF page (in mm), fitting to contentWidthMM
    const imageWidthOnPDF = contentWidthMM;
    // Calculate the corresponding height on the PDF page (in mm) to maintain aspect ratio
    const imageHeightOnPDF = (canvasPixelHeight / canvasPixelWidth) * imageWidthOnPDF;

    let yPositionOnCanvasPixels = 0; // Current Y position on the source canvas in pixels

    while (yPositionOnCanvasPixels < canvasPixelHeight) {
      // Calculate how many canvas pixels (height) correspond to one PDF page's content height (contentHeightMM)
      // This is the maximum height from the source canvas we can take for one PDF page.
      const maxChunkPixelHeight = (contentHeightMM / imageHeightOnPDF) * canvasPixelHeight;
      
      // Determine the actual height of the current chunk from the source canvas
      const currentChunkPixelHeight = Math.min(maxChunkPixelHeight, canvasPixelHeight - yPositionOnCanvasPixels);

      if (currentChunkPixelHeight <= 0) {
        break; // Should not happen if logic is correct, but good safeguard
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasPixelWidth;
      tempCanvas.height = currentChunkPixelHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        // Draw the chunk from the main canvas to the temporary canvas
        tempCtx.drawImage(canvas, 0, yPositionOnCanvasPixels, canvasPixelWidth, currentChunkPixelHeight, 0, 0, canvasPixelWidth, currentChunkPixelHeight);
        const chunkImgData = tempCanvas.toDataURL('image/png');

        // Calculate the display height of this chunk on the PDF page (in mm), maintaining aspect ratio
        // The width will always be imageWidthOnPDF (contentWidthMM)
        const chunkDisplayHeightOnPDF = (currentChunkPixelHeight / canvasPixelWidth) * imageWidthOnPDF;

        pdf.addImage(chunkImgData, 'PNG', marginMM, marginMM, imageWidthOnPDF, chunkDisplayHeightOnPDF);
        
        yPositionOnCanvasPixels += currentChunkPixelHeight;

        if (yPositionOnCanvasPixels < canvasPixelHeight) {
          pdf.addPage();
        }
      } else {
        console.error("Failed to get context for temporary chunk canvas");
        hiddenElementDetails.forEach(item => { item.element.style.display = item.originalDisplay; });
        if (enforcedWidth) element.removeAttribute('data-pdf-export-temp-id');
        return false;
      }
    }

    pdf.save(fileName);
    return true;

  } catch (error) {
    console.error('PDF 導出錯誤:', error);
    if (enforcedWidth) {
      element.removeAttribute('data-pdf-export-temp-id'); // Ensure cleanup on error
    }
    return false;
  } finally {
    // 恢復元素顯示
    hiddenElementDetails.forEach(item => {
      item.element.style.display = item.originalDisplay;
    });
    // Ensure cleanup in finally, though it's also in try/catch for the attribute
    if (enforcedWidth && element.hasAttribute('data-pdf-export-temp-id')) {
        element.removeAttribute('data-pdf-export-temp-id');
    }
  }
};
