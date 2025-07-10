import React from 'react';
import Alert from '../../common/Alert/Alert';
import {
  FormHeader,
  InspectionTable,
  PhotoUpload,
  SignaturePad,
  FormActions
} from './components';
import { useInspectionForm, InspectionStage, stageDisplayNames } from './hooks';
import './FoundationStageForm.css';

interface FoundationStageFormProps {
  stage?: InspectionStage;
}

const FoundationStageForm: React.FC<FoundationStageFormProps> = ({ stage = 'FoundationStage' }) => {
  // Use the custom hook for form logic
  const {
    values,
    handleChange,
    handleStatusChange,
    handleNoteChange,
    showSignaturePad,
    setShowSignaturePad,
    signatureDataURL,
    photoDataURL,
    handlePhotoChange, // Use the new handler
    isSubmitting,
    submitSuccess,
    submitError,
    handleSignatureConfirm,
    handlePrint,
    handleExportToPDF
  } = useInspectionForm(stage);
  
  return (
    <div className="foundation-stage-form-container">
      <div className="form-header">
        <div className="header-content">
          <img 
            src="	https://zfeng.com.tw/wp-content/uploads/2023/05/logo-color.png" 
            alt="翊豐營造股份有限公司 LOGO" 
            className="company-logo" 
          />
          <div className="header-text">
            <h1>翊豐營造股份有限公司</h1>
            <h2>每日巡檢紀錄-{stageDisplayNames[stage]}</h2>
          </div>
        </div>
      </div>

      <form className="inspection-form" onSubmit={(e) => {
        e.preventDefault();
        // 檢查是否已有簽名，如果沒有則顯示簽名板
        if (!signatureDataURL) {
          setShowSignaturePad(true);
        } else {
          // 如果已有簽名，直接提交表單
          handleSignatureConfirm(signatureDataURL);
        }
      }}>
        {/* Form Header with Date and Site Selection */}
        <FormHeader
          date={values.date}
          site={values.siteName}
          inspector={values.inspector}
          onDateChange={(date) => handleChange({
            target: { name: 'date', value: date }
          } as React.ChangeEvent<HTMLInputElement>)}
          onSiteChange={(site) => handleChange({
            target: { name: 'siteName', value: site }
          } as React.ChangeEvent<HTMLInputElement>)}
          onInspectorChange={(inspector) => handleChange({
            target: { name: 'inspector', value: inspector }
          } as React.ChangeEvent<HTMLInputElement>)}
        />

        {/* Inspection Items Table */}
        <InspectionTable
          items={values.inspectionItems}
          onStatusChange={handleStatusChange}
          onNoteChange={handleNoteChange}
        />

        <div className="signature-photo-container">
          {/* Photo Upload Component */}
          <PhotoUpload
            onPhotoChange={handlePhotoChange} // Pass the new handler to the component
            photoDataURL={photoDataURL}
          />

          <div className="signature-area">
            <h3>巡檢人員簽章</h3>
            <div 
              className="signature-display" 
              onClick={() => setShowSignaturePad(true)}
            >
              {signatureDataURL ? (
                <img src={signatureDataURL} alt="簽名" />
              ) : (
                <div className="signature-placeholder">
                  點擊此處進行簽名
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="otherNotes">其他發現/建議：</label>
          <textarea
            id="otherNotes"
            name="otherNotes"
            rows={3}
            value={values.otherNotes}
            onChange={handleChange}
          />
        </div>

        {/* Form Actions */}
        <FormActions
          onSubmit={() => setShowSignaturePad(true)}
          onPrint={handlePrint}
          onExportPDF={handleExportToPDF}
          isSubmitting={isSubmitting}
        />

        {submitSuccess && (
          <Alert type="success" message="表單已成功提交" />
        )}
        
        {submitError && (
          <Alert type="error" message={submitError} />
        )}

        <div className="form-number">ZF-1-113-10-2</div>
      </form>

      {/* Signature Modal */}
      {showSignaturePad && (
        <SignaturePad
          isVisible={showSignaturePad}
          onConfirm={handleSignatureConfirm}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
};

export default FoundationStageForm;
