import { useState } from 'react';

const useCheckbox = (options, preSelectedIds = []) => {
  const [checkedItems, setCheckedItems] = useState(preSelectedIds);

  const handleCheckboxChange = (id) => {
    const isChecked = checkedItems.includes(id);

    isChecked
      ? setCheckedItems(checkedItems.filter((item) => item !== id))
      : setCheckedItems([...checkedItems, id]);
  };

  const checkboxes = options.map((option) => (
    <div className="w-full md:w-1/2 mb-4 md:pl-2">
      <label key={option._id} className="inline-flex items-center">
        <input
          type="checkbox"
          className="form-checkbox h-5 w-5 text-indigo-600 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          name={option.title}
          value={option.title}
          checked={checkedItems.includes(option._id)}
          onChange={() => handleCheckboxChange(option._id)}
        />

        <span className="ml-2 text-gray-700">{option.title}</span>
      </label>
    </div>
  ));

  const selectedIds = checkedItems;

  return [selectedIds, checkboxes];
};

export default useCheckbox;