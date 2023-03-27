import { useState } from 'react';

const useRadio = (options, preSelectedId = null) => {
  const [selectedId, setSelectedId] = useState(preSelectedId);

  const handleRadioChange = (id) => {
    setSelectedId(id);
  };

  const radios = options.map((option) => (
    <div className="w-full md:w-1/2 mb-4 md:pl-2" key={option._id}>
      <label className="inline-flex items-center">
        <input
          type="radio"
          className="form-radio h-5 w-5 text-indigo-600 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          name={option.title}
          value={option.title}
          checked={selectedId === option._id}
          onChange={() => handleRadioChange(option._id)}
        />
        <span className="ml-2 text-gray-700">{option.title}</span>
      </label>
    </div>
  ));

  return [selectedId, radios];
};

export default useRadio;
