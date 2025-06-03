import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useUserCases } from '../../../../services/inspectionService';

interface FormHeaderProps {
  date: string;
  site: string;
  inspector: string;
  onDateChange: (date: string) => void;
  onSiteChange: (site: string) => void;
  onInspectorChange: (inspector: string) => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  date,
  site,
  inspector,
  onDateChange,
  onSiteChange,
  onInspectorChange,
}) => {
  // 獲取登入用戶信息
  const { user } = useAuth();
  
  // 使用自定義 Hook 獲取用戶的案場列表
  const { userCases, isLoading: isLoadingCases } = useUserCases(user?.name);
  
  // 使用 ref 追蹤狀態，避免重複觸發
  const isInitialSiteMount = useRef(true);
  
  // 計算日期範圍 - 確保使用本地時間並處理時區問題
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const getDateMinusDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const maxDate = getTodayDateString();
  const minDate = getDateMinusDays(3);
  
  // 處理日期變更並驗證日期範圍
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue <= maxDate && selectedValue >= minDate) {
      onDateChange(selectedValue);
    } else {
      e.target.value = date;
    }
  };

  // 當用戶案場列表變更時，自動選擇案場
  useEffect(() => {
    // 如果有案場數據且尚未選擇案場或初次加載
    if (userCases.length > 0 && (!site || isInitialSiteMount.current)) {
      isInitialSiteMount.current = false;
      onSiteChange(userCases[0]);
    }
  }, [userCases, site, onSiteChange]);

  // 當案場變更時，自動設置巡檢人員為當前登入用戶
  useEffect(() => {
    // 確保用戶已登入且有選擇案場
    if (user?.name && site && inspector !== user.name) {
      onInspectorChange(user.name);
    }
  }, [site, user?.name, inspector, onInspectorChange]);

  return (
    <div className="form-header">
      <div className="form-meta">
        <div className="form-field">
          <label htmlFor="inspection-date">日期：</label>
          <input
            type="date"
            id="inspection-date"
            value={date}
            onChange={handleDateChange}
            required
            max={maxDate}
            min={minDate}
          />
        </div>
        <div className="form-field">
          <label htmlFor="site-name">案場名稱：</label>
          {isLoadingCases ? (
            <div className="loading-indicator">正在加載案場資料...</div>
          ) : userCases.length === 0 ? (
            <div className="no-data-message">無可用案場</div>
          ) : (
            <select
              id="site-name"
              value={site}
              onChange={(e) => onSiteChange(e.target.value)}
              required
            >
              <option value="">請選擇案場：</option>
              {userCases.map(caseName => (
                <option key={caseName} value={caseName}>
                  {caseName}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div className="form-field">
          <label htmlFor="inspector">巡檢人員：</label>
          <div className="inspector-display auto-filled">{user?.name || '未登入用戶'}</div>
          <input 
            type="hidden" 
            id="inspector"
            value={user?.name || ''}
            onChange={() => {}} 
          />
        </div>
      </div>
    </div>
  );
};

export default FormHeader;
