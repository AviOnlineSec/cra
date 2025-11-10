import axiosInstance from './axios';

export const getMonthlyReport = async (startDate, endDate) => {
    const response = await axiosInstance.get(`/api/reports/monthly/?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
};

export const getYearlyReport = async (startYear, endYear) => {
    const response = await axiosInstance.get(`/api/reports/yearly/?start_year=${startYear}&end_year=${endYear}`);
    return response.data;
};