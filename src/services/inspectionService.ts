import { useEffect, useState } from 'react';

// 定義案場和巡檢人員的資料結構
export interface CaseData {
  [key: string]: string[];
}

// 根據巡檢人員名稱獲取其負責的案場
export const getUserCases = async (inspectorName: string): Promise<string[]> => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/caseAndPIC.json`);
    const data: CaseData = await response.json();
    
    // 找出包含該巡檢人員的所有案場
    const userCases = Object.entries(data)
      .filter(([_, inspectors]) => inspectors.includes(inspectorName))
      .map(([caseName]) => caseName);
    
    return userCases;
  } catch (error) {
    console.error('Error fetching user cases:', error);
    return [];
  }
};

// 根據案場名稱獲取巡檢人員列表
export const getCaseInspectors = async (caseName: string): Promise<string[]> => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/caseAndPIC.json`);
    const data: CaseData = await response.json();
    
    return data[caseName] || [];
  } catch (error) {
    console.error('Error fetching case inspectors:', error);
    return [];
  }
};

// 自定義 Hook，用於獲取當前用戶的案場列表
export const useUserCases = (userName: string | undefined) => {
  const [userCases, setUserCases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserCases = async () => {
      if (!userName) {
        setUserCases([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const cases = await getUserCases(userName);
        setUserCases(cases);
        setError(null);
      } catch (err) {
        setError('無法獲取案場資料');
        console.error('Error in useUserCases:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserCases();
  }, [userName]);
  
  return { userCases, isLoading, error };
};
