import { useState } from 'react';

const useDateRangePicker = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  return {
    startDate,
    endDate,
    handleStartDateChange,
    handleEndDateChange,
  };
};

export default useDateRangePicker;
