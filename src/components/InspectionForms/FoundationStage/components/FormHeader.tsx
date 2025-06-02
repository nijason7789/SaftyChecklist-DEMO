import React, { useState, useEffect } from 'react';

interface FormHeaderProps {
  date: string;
  site: string;
  inspector: string;
  onDateChange: (date: string) => void;
  onSiteChange: (site: string) => void;
  onInspectorChange: (inspector: string) => void;
}

interface CaseData {
  [key: string]: string[];
}

const FormHeader: React.FC<FormHeaderProps> = ({
  date,
  site,
  inspector,
  onDateChange,
  onSiteChange,
  onInspectorChange,
}) => {
  const [caseOptions, setCaseOptions] = useState<string[]>([]);
  const [inspectorOptions, setInspectorOptions] = useState<string[]>([]);
  const [caseData, setCaseData] = useState<CaseData>({});

  useEffect(() => {
    // Fetch the case data from the public JSON file
    // 使用 process.env.PUBLIC_URL 來獲取正確的基礎路徑
    fetch(`${process.env.PUBLIC_URL}/data/caseAndPIC.json`)
      .then(response => response.json())
      .then((data: CaseData) => {
        // Extract the case names (keys) from the data
        const caseNames = Object.keys(data);
        setCaseOptions(caseNames);
        setCaseData(data);
      })
      .catch(error => {
        console.error('Error loading case data:', error);
      });
  }, []);
  
  // Update inspector options when site changes
  useEffect(() => {
    if (site && caseData[site]) {
      setInspectorOptions(caseData[site]);
      
      // If current inspector is not in the new list, reset it
      if (inspector && !caseData[site].includes(inspector)) {
        onInspectorChange('');
      }
    } else {
      setInspectorOptions([]);
    }
  }, [site, caseData, inspector, onInspectorChange]);

  return (
    <div className="form-header">
      <div className="form-meta">
        <div className="form-field">
          <label htmlFor="inspection-date">日期：</label>
          <input
            type="date"
            id="inspection-date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="site-name">案場名稱：</label>
          <select
            id="site-name"
            value={site}
            onChange={(e) => onSiteChange(e.target.value)}
            required
          >
            <option value="">請選擇案場：</option>
            {caseOptions.map(caseName => (
              <option key={caseName} value={caseName}>
                {caseName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-field">
          <label htmlFor="inspector">巡檢人員：</label>
          <select
            id="inspector"
            value={inspector}
            onChange={(e) => onInspectorChange(e.target.value)}
            required
            disabled={!site || inspectorOptions.length === 0}
          >
            <option value="">請選擇巡檢人員</option>
            {inspectorOptions.map(inspectorName => (
              <option key={inspectorName} value={inspectorName}>
                {inspectorName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;
