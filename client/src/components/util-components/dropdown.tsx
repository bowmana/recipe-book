import React, { useEffect, useState } from 'react';
import Select from 'react-select';

import classNames from 'classnames';
import styles from './dropdown.module.scss';
import Placeholder from 'react-select/dist/declarations/src/components/Placeholder';

export interface DropdownProps {
    className?: string;
    initialOptions?: Option[];
    onChange?: (selectedOption: Option | null) => void;
    retrievedSelected?: Option | null;
    place_holder?: string;
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
    place_holder,
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
    const dropdownClassName = className ? styles[className] : null;
    const customStyles = {
        control: (base: any, state: any) => ({
            ...base,

            border: 'none', // Remove the border
            backgroundColor: 'transparent',
            boxShadow: 'none',
        }),

        menu: (base: any, state: any) => ({
            ...base,
            backgroundColor: '#e7e6de',

            border: '1px solid black',
            boxShadow: 'none',
            borderRadius: '15px',
        }),
        indicatorSeparator: (base: any, state: any) => ({
            ...base,
            backgroundColor: 'black',
        }),
        dropdownIndicator: (base: any, state: any) => ({
            ...base,
            color: 'black',
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: 'transparent',
            color: 'black',
            '&:hover': {
                backgroundColor: '#e2bd98',
                color: 'white',
            },
        }),

        singleValue: (base: any, state: any) => ({
            ...base,
            color: '#bd6160',
        }),

        placeholder: (base: any, state: any) => ({
            ...base,
            color: '#bd6160',
        }),

        input: (base: any, state: any) => ({
            ...base,
            color: '#bd6160',
        }),
    };
    return (
        <div className={classNames(styles.root, dropdownClassName)}>
            <Select
                styles={customStyles}
                value={retrievedSelected || selectedOption}
                onChange={handleChange}
                isClearable
                isSearchable
                placeholder={place_holder || 'Select or enter an option ...'}
                onInputChange={handleInputChange}
                options={options}
            />
        </div>
    );
};
