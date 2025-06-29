import React, { createContext, useState, useEffect, useContext } from 'react';
import { useGetReportsQuery, Report } from '../store/api/reportsApi';
// import { loadReports } from '../api';

// Define the shape of the context
type ReportContextType = {
  reports?: Report[];
  fetchReports: () => void;
  updateReports: () => void;
};


// Create the context with a default undefined value
const ReportContext = createContext<ReportContextType | undefined>(undefined);

// Create a provider component
export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const [reportsUpdated, setReportsUpdated] = useState(false);
  const { data, isLoading } = useGetReportsQuery();

  useEffect(() => {
    if (!!localStorage.getItem('token') && localStorage.getItem('role') === 'Admin') fetchReports();
  }, [reportsUpdated]);

  const fetchReports = async () => {
    // const fetchedReports = await loadReports();
    // setReports(fetchedReports);
  };

  const updateReports = () => {
    setReportsUpdated(!reportsUpdated);
  };

  return (
    <ReportContext.Provider value={{ reports: data?.reports, fetchReports, updateReports }}>
      {children}
    </ReportContext.Provider>
  );
};

// Custom hook to use the ReportContext
export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};
