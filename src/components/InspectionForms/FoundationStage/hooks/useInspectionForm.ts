import React, { useState, useEffect, useRef } from 'react';
import useForm from '../../../../hooks/useForm';
import { InspectionItemData } from '../components';
import { useAuth } from '../../../../context/AuthContext';
import { exportElementToPDF } from '../../../../utils/pdfExport';

// Define form data interface
export interface InspectionFormData {
  date: string;
  siteName: string;
  location: string;
  inspector: string;
  inspectionItems: InspectionItemData[];
  otherNotes: string;
  signature: string | null;
  photo: File | null; // Changed to store the File object for upload
}

// Create initial inspection items
const createInitialInspectionItems = (items: string[]): InspectionItemData[] => {
  return items.map((description, index) => ({
    id: index + 1,
    description,
    name: `項目 ${index + 1}`,
    status: 'normal',
    note: '',
  }));
};

// Define available inspection stages as a type
export type InspectionStage = 'FoundationStage' | 'StructureStage' | 'DecorationStage';

// Define stage display names mapping
export const stageDisplayNames: Record<InspectionStage, string> = {
  FoundationStage: '基礎階段',
  StructureStage: '結構階段',
  DecorationStage: '裝修階段'
};

export const useInspectionForm = (stage: InspectionStage = 'FoundationStage') => {
  const { user } = useAuth();
  
  // State for signature and photo
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureDataURL, setSignatureDataURL] = useState<string | null>(null);
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null); // For preview
  const [compressedPhotoFile, setCompressedPhotoFile] = useState<File | null>(null); // For upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [inspectionItems, setInspectionItems] = useState<InspectionItemData[]>([]);
  
  const hasSetInspectionItems = useRef(false);

  useEffect(() => {
    const fetchInspectionItems = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/inspection_item.json`);
        const data = await response.json();
        if (data[stage]) {
          setInspectionItems(createInitialInspectionItems(data[stage]));
        } else {
          console.error(`No inspection items found for stage: ${stage}`);
        }
      } catch (error) {
        console.error('Error fetching inspection items:', error);
      }
    };

    fetchInspectionItems();
  }, [stage]); // Add stage as dependency to reload when it changes

  const initialValues: InspectionFormData = {
    date: new Date().toISOString().split('T')[0],
    siteName: '',
    location: '',
    inspector: '',
    inspectionItems: [],
    otherNotes: '',
    signature: null,
    photo: null,
  };

  const validateForm = (values: InspectionFormData) => {
    const errors: Record<string, string> = {};
    
    if (!values.siteName) {
      errors.siteName = '請選擇案場名稱';
    }
    
    if (!values.location) {
      errors.location = '請輸入巡檢地點';
    }
    
    return Object.keys(errors).length ? errors : null;
  };

  const handleSubmit = async (values: InspectionFormData) => {
    try {
      setIsSubmitting(true);
      
      console.log('Form submitted:', {
        ...values,
        signature: signatureDataURL,
        photo: compressedPhotoFile, // Use the compressed file for submission
        inspector: user?.name || user?.email || '未登入用戶',
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      setSubmitError('');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('表單提交失敗，請稍後再試');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { values, errors, touched, handleChange, handleSubmit: submitForm } = useForm({
    initialValues,
    validate: validateForm,
    onSubmit: handleSubmit,
  });
  
  useEffect(() => {
    if (inspectionItems.length > 0 && !hasSetInspectionItems.current) {
      hasSetInspectionItems.current = true;
      handleChange({
        target: { name: 'inspectionItems', value: inspectionItems }
      } as any);
    }
  }, [inspectionItems, handleChange]);

  const handleStatusChange = (id: number, status: 'normal' | 'needsImprovement') => {
    const updatedItems = values.inspectionItems.map(item => 
      item.id === id ? { ...item, status } : item
    );
    
    handleChange({
      target: {
        name: 'inspectionItems',
        value: updatedItems,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const handleNoteChange = (id: number, note: string) => {
    const updatedItems = values.inspectionItems.map(item => 
      item.id === id ? { ...item, note } : item
    );
    
    handleChange({
      target: {
        name: 'inspectionItems',
        value: updatedItems,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  // New handler for photo changes from PhotoUpload component
  const handlePhotoChange = (newPhotoDataURL: string | null, newCompressedFile: File | null) => {
    setPhotoDataURL(newPhotoDataURL);
    setCompressedPhotoFile(newCompressedFile);
  };

  const handleSignatureConfirm = (signatureDataURL: string) => {
    setSignatureDataURL(signatureDataURL);
    setShowSignaturePad(false);
    submitForm({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
  };

  const handlePrint = () => {
    // 保存原始標題
    const originalTitle = document.title;
    
    // 設置檔名作為頁面標題 (大多數瀏覽器會使用頁面標題作為 PDF 的預設檔名)
    const siteNameForFile = values.siteName || '未提供案場';
    const dateForFile = values.date || new Date().toISOString().split('T')[0];
    const stageDisplayName = stageDisplayNames[stage] || '未知階段';
    const fileName = `${siteNameForFile}_每日巡檢紀錄-${stageDisplayName}_${dateForFile}`;
    document.title = fileName;
    
    // 在列印前找到並隱藏空的輸入欄位和未選中的 radio button
    const formElement = document.querySelector('.foundation-stage-form-container') as HTMLElement;
    if (!formElement) {
      console.error('找不到表單元素');
      return;
    }
    
    // 1. 隱藏空的文本輸入欄位
    const emptyInputs = formElement.querySelectorAll('.inspection-table input[type="text"]') as NodeListOf<HTMLInputElement>;
    const hiddenElements: HTMLElement[] = [];
    
    emptyInputs.forEach(input => {
      if (!input.value.trim()) {
        hiddenElements.push(input);
        input.style.display = 'none';
      }
    });
    
    // 2. 隱藏未選中的 radio button
    const radioInputs = formElement.querySelectorAll('.inspection-table input[type="radio"]') as NodeListOf<HTMLInputElement>;
    
    radioInputs.forEach(radio => {
      if (!radio.checked) {
        hiddenElements.push(radio);
        radio.style.display = 'none';
      }
    });
    
    // 列印
    window.print();
    
    // 恢復所有被隱藏的元素
    hiddenElements.forEach(element => {
      element.style.display = '';
    });
    
    // 恢復原始標題
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleExportToPDF = async () => {
    const formElement = document.querySelector('.foundation-stage-form-container') as HTMLElement;
    if (!formElement) {
      console.error('找不到表單元素');
      return;
    }

    // 設置加載狀態
    setIsSubmitting(true);

    const siteNameForFile = values.siteName || '未提供案場';
    const dateForFile = values.date || new Date().toISOString().split('T')[0];
    const stageDisplayName = stageDisplayNames[stage] || '未知階段';
    const fileName = `${siteNameForFile}_每日巡檢紀錄-${stageDisplayName}_${dateForFile}.pdf`;
    
    try {
      // 找到並隱藏不需要在 PDF 中顯示的元素
      const buttonsToHide = formElement.querySelectorAll('.action-buttons');
      const headerToHide = formElement.querySelector('.dashboard-link');
      const hiddenElements: HTMLElement[] = [];

      // 1. 自動隱藏空的輸入欄位
      const emptyInputs = formElement.querySelectorAll('.inspection-table input[type="text"]') as NodeListOf<HTMLInputElement>;

      emptyInputs.forEach(input => {
        if (!input.value.trim()) {
          hiddenElements.push(input);
          input.style.display = 'none';
        }
      });
      
      // 2. 隱藏未選中的 radio button
      const radioInputs = formElement.querySelectorAll('.inspection-table input[type="radio"]') as NodeListOf<HTMLInputElement>;
      
      radioInputs.forEach(radio => {
        if (!radio.checked) {
          hiddenElements.push(radio);
          radio.style.display = 'none';
        }
      });

      // 自動隱藏按鈕和頁頭連結
      buttonsToHide.forEach((button) => {
        (button as HTMLElement).style.display = 'none';
      });
      if (headerToHide) {
        (headerToHide as HTMLElement).style.display = 'none';
      }

      // 使用導出工具導出 PDF
      await exportElementToPDF(formElement, fileName, {
        margin: 10,
        scale: 0.95,
      });

      // 恢復隱藏的元素
      buttonsToHide.forEach((button) => {
        (button as HTMLElement).style.display = '';
      });
      if (headerToHide) {
        (headerToHide as HTMLElement).style.display = '';
      }

      // 恢復所有被隱藏的元素
      hiddenElements.forEach(element => {
        element.style.display = '';
      });
    } catch (error) {
      console.error('PDF 導出過程中發生意外錯誤:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoFormatted = threeDaysAgo.toISOString().split('T')[0];

  return {
    values,
    errors,
    touched,
    handleChange,
    handleStatusChange,
    handleNoteChange,
    submitForm,
    showSignaturePad,
    setShowSignaturePad,
    signatureDataURL,
    photoDataURL,
    handlePhotoChange, // Expose the new handler
    isSubmitting,
    submitSuccess,
    submitError,
    handleSignatureConfirm,
    handlePrint,
    handleExportToPDF,
    dateConstraints: {
      min: threeDaysAgoFormatted,
      max: today
    },
    user
  };
};

export default useInspectionForm;
