import React, { useState, useEffect, useRef } from 'react';
import useForm from '../../../../hooks/useForm';
import { InspectionItemData } from '../components';
import { useAuth } from '../../../../context/AuthContext';
import { exportElementToPDF } from '../../../../utils/pdfExport';

// Define form data interface
export interface FoundationStageFormData {
  date: string;
  siteName: string;
  location: string;
  inspector: string;
  inspectionItems: InspectionItemData[];
  otherNotes: string;
  signature: string | null;
  photo: string | null;
}

// Create initial inspection items
const createInitialInspectionItems = (items: string[]): InspectionItemData[] => {
  return items.map((description, index) => ({
    id: index + 1,
    description,
    name: `項目 ${index + 1}`, // Add name field required by InspectionItemData
    status: 'normal',
    note: '',
  }));
};

export const useInspectionForm = () => {
  const { user } = useAuth();
  
  // State for signature and photo
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureDataURL, setSignatureDataURL] = useState<string | null>(null);
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [inspectionItems, setInspectionItems] = useState<InspectionItemData[]>([]);
  
  // 使用 ref 來避免無限循環更新
  const hasSetInspectionItems = useRef(false);

  // Fetch inspection items from JSON file
  useEffect(() => {
    const fetchInspectionItems = async () => {
      try {
        // 使用 process.env.PUBLIC_URL 來獲取正確的基礎路徑
        const response = await fetch(`${process.env.PUBLIC_URL}/data/inspection_item.json`);
        const data = await response.json();
        if (data.FoundationStage) {
          setInspectionItems(createInitialInspectionItems(data.FoundationStage));
        }
      } catch (error) {
        console.error('Error fetching inspection items:', error);
      }
    };

    fetchInspectionItems();
  }, []);

  // Initialize form with default values
  const initialValues: FoundationStageFormData = {
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    siteName: '',
    location: '',
    inspector: '',
    inspectionItems: [], // Will be populated from the JSON file
    otherNotes: '',
    signature: null,
    photo: null,
  };

  // Form validation function
  const validateForm = (values: FoundationStageFormData) => {
    const errors: Record<string, string> = {};
    
    if (!values.siteName) {
      errors.siteName = '請選擇案場名稱';
    }
    
    if (!values.location) {
      errors.location = '請輸入巡檢地點';
    }
    
    return Object.keys(errors).length ? errors : null;
  };

  // Handle form submission
  const handleSubmit = async (values: FoundationStageFormData) => {
    try {
      setIsSubmitting(true);
      
      // In a real application, you would send this data to your backend
      // For now, we'll simulate a successful submission
      console.log('Form submitted:', {
        ...values,
        signature: signatureDataURL,
        photo: photoDataURL,
        inspector: user?.name || user?.email || '未登入用戶',
      });
      
      // Simulate API delay
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

  // Initialize form hook
  const { values, errors, touched, handleChange, handleSubmit: submitForm } = useForm({
    initialValues,
    validate: validateForm,
    onSubmit: handleSubmit,
  });
  
  // Update form values when inspection items are loaded
  useEffect(() => {
    if (inspectionItems.length > 0 && !hasSetInspectionItems.current) {
      // 設置標記以避免重複更新
      hasSetInspectionItems.current = true;
      
      // Update the inspectionItems in the form values
      // Use any type to avoid TypeScript errors with complex form values
      handleChange({
        target: { name: 'inspectionItems', value: inspectionItems }
      } as any);
    }
  }, [inspectionItems, handleChange]);

  // Handle status change for inspection items
  const handleStatusChange = (id: number, status: 'normal' | 'needsImprovement') => {
    const updatedItems = values.inspectionItems.map(item => 
      item.id === id ? { ...item, status } : item
    );
    
    // Update form values
    handleChange({
      target: {
        name: 'inspectionItems',
        value: updatedItems,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  // Handle note change for inspection items
  const handleNoteChange = (id: number, note: string) => {
    const updatedItems = values.inspectionItems.map(item => 
      item.id === id ? { ...item, note } : item
    );
    
    // Update form values
    handleChange({
      target: {
        name: 'inspectionItems',
        value: updatedItems,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  // Handle signature confirmation
  const handleSignatureConfirm = (signatureDataURL: string) => {
    setSignatureDataURL(signatureDataURL);
    setShowSignaturePad(false);
    
    // Submit form
    submitForm({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle export to PDF functionality
  const handleExportToPDF = async () => {
    // 獲取表單元素
    const formElement = document.querySelector('.foundation-stage-form-container') as HTMLElement;
    if (!formElement) {
      console.error('找不到表單元素');
      return;
    }

    // 設定檔案名稱格式：案場名稱_每日巡檢紀錄-基礎階段_日期.pdf
    const fileName = `${values.siteName}_每日巡檢紀錄-基礎階段_${values.date}.pdf`;
    
    // 需要隱藏的元素
    const hideElements = formElement.querySelectorAll('.form-actions button, .dashboard-header');
    
    // 使用工具函數導出 PDF
    const success = await exportElementToPDF(formElement, fileName, {
      hideElements,
      scale: 3,  // 提高解析度以確保文字清晰
      margin: 10, // 增加邊距
      pageFormat: 'a4',
      orientation: 'p' // portrait 直向
    });
    
    if (success) {
      console.log('PDF 導出成功');
    } else {
      console.error('PDF 導出失敗');
    }
  };

  // Get date constraints
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
    setPhotoDataURL,
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
