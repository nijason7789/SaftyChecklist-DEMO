import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * 將 HTML 元素導出為 PDF 檔案
 * @param element 要導出的 HTML 元素
 * @param fileName PDF 檔案名稱
 * @param options 配置選項
 */
export const exportElementToPDF = async (
  element: HTMLElement,
  fileName: string,
  options: {
    hideElements?: NodeListOf<Element> | Element[];
    scale?: number;
    margin?: number;
    pageFormat?: string;
    orientation?: 'p' | 'l'; // portrait 或 landscape
  } = {}
) => {
  if (!element) {
    console.error('找不到要導出的元素');
    return;
  }

  const {
    hideElements,
    scale = 2,
    margin = 5,
    pageFormat = 'a4',
    orientation = 'p'
  } = options;

  // 保存原始顯示狀態
  const originalDisplays: string[] = [];
  
  try {
    // 暫時隱藏指定元素
    if (hideElements) {
      Array.from(hideElements).forEach((el, index) => {
        originalDisplays[index] = (el as HTMLElement).style.display;
        (el as HTMLElement).style.display = 'none';
      });
    }
    
    // 使用 html2canvas 將元素轉換為圖像
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      allowTaint: true
    });
    
    // 將 canvas 轉換為圖像數據
    const imgData = canvas.toDataURL('image/png');
    
    // 創建 PDF 文檔
    const pdf = new jsPDF(orientation, 'mm', pageFormat);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 獲取圖像屬性
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // 計算縮放比例，確保內容能完整顯示
    const maxWidth = pageWidth - (margin * 2);
    const ratio = imgWidth / imgHeight;
    
    let finalWidth = maxWidth;
    let finalHeight = finalWidth / ratio;
    
    // 如果高度超出頁面，則按高度縮放
    if (finalHeight > pageHeight - (margin * 2)) {
      finalHeight = pageHeight - (margin * 2);
      finalWidth = finalHeight * ratio;
    }
    
    // 添加圖像到 PDF
    pdf.addImage(imgData, 'PNG', margin, margin, finalWidth, finalHeight);
    
    // 保存 PDF 文件
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('生成 PDF 時發生錯誤:', error);
    return false;
  } finally {
    // 恢復元素顯示
    if (hideElements) {
      Array.from(hideElements).forEach((el, index) => {
        (el as HTMLElement).style.display = originalDisplays[index] || '';
      });
    }
  }
};
