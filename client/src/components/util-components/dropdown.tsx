import React, { useEffect, useState } from 'react';
import Select from 'react-select';

import classNames from 'classnames';
import styles from './dropdown.module.scss';

export interface DropdownProps {
    className?: string;
    initialOptions?: Option[];
    onChange?: (selectedOption: Option | null) => void;
    retrievedSelected?: Option | null;
}
interface Option {
    value: string;
    label: string;
}

export const Dropdown = ({
    className,
    initialOptions,
    onChange,
    retrievedSelected,
}: DropdownProps) => {
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);
    //set initial options list to the props passed in

    const [options, setOptions] = useState<Option[]>(initialOptions || []);

    useEffect(() => {
        if (initialOptions) {
            setOptions(initialOptions);
        }
    }, [initialOptions]);
    const resetOptions = () => {
        setOptions(initialOptions || []);
    };

    const handleChange = (selectedOption: Option | null) => {
        setSelectedOption(selectedOption);
        resetOptions();
        if (onChange) {
            onChange(selectedOption);
        }

        console.log(`Option selected:`, selectedOption);
    };

    const handleInputChange = (inputValue: string) => {
        const optionExists = options.some(
            (option) => option.value.toLowerCase() === inputValue.toLowerCase()
        );
        const otherOption: Option = { value: inputValue, label: inputValue };
        if (inputValue.length > 0 && !optionExists) {
            setOptions([...options, otherOption]);
        }
    };

    return (
        <div className={classNames(styles.root, className)}>
            <Select
                value={retrievedSelected || selectedOption}
                onChange={handleChange}
                isClearable
                isSearchable
                placeholder="Select or enter an option..."
                onInputChange={handleInputChange}
                options={options}
            />
        </div>
    );
};
