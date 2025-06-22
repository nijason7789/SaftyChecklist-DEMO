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

export const useInspectionForm = () => {
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
        if (data.FoundationStage) {
          setInspectionItems(createInitialInspectionItems(data.FoundationStage));
        }
      } catch (error) {
        console.error('Error fetching inspection items:', error);
      }
    };

    fetchInspectionItems();
  }, []);

  const initialValues: FoundationStageFormData = {
    date: new Date().toISOString().split('T')[0],
    siteName: '',
    location: '',
    inspector: '',
    inspectionItems: [],
    otherNotes: '',
    signature: null,
    photo: null,
  };

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

  const handleSubmit = async (values: FoundationStageFormData) => {
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
    window.print();
  };

  const handleExportToPDF = async () => {
    const formElement = document.querySelector('.foundation-stage-form-container') as HTMLElement;
    if (!formElement) {
      console.error('找不到表單元素');
      return;
    }

    const siteNameForFile = values.siteName || '未提供案場';
    const dateForFile = values.date || new Date().toISOString().split('T')[0];
    const fileName = `${siteNameForFile}_每日巡檢紀錄-基礎階段_${dateForFile}.pdf`;
    
    const elementsToHide = formElement.querySelectorAll('.form-actions button, .dashboard-header');
    
    try {
      const success = await exportElementToPDF(formElement, fileName, {
        hideElements: elementsToHide,
        scale: 3,
        margin: 10,
        pageFormat: 'a4',
        orientation: 'p',
        enforcedWidth: 800,
      });
      
      if (success) {
        console.log('PDF 導出成功:', fileName);
      } else {
        console.error('PDF 導出失敗');
      }
    } catch (exportError) {
      console.error('PDF 導出過程中發生意外錯誤:', exportError);
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
