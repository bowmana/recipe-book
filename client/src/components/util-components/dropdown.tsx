import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import styles from './dropdown.module.scss';
import Placeholder from 'react-select/dist/declarations/src/components/Placeholder';

export interface DropdownProps {
    className?: string;
    initialOptions?: Option[];
    onChange?: (selectedOption: Option | null) => void;
    retrievedSelected?: Option | null;
    place_holder?: string;
    ref?: React.Ref<any>;
   
}
interface Option {
    value: string;
    label: string;
}

export const Dropdown = forwardRef((props: DropdownProps, ref: any) => {
    useImperativeHandle(ref, () => ({
        clear,
    }));

    const [selectedOption, setSelectedOption] = useState<Option | null>(null);
    //set initial options list to the props passed in

    const [options, setOptions] = useState<Option[]>(props.initialOptions || []);

    useEffect(() => {
        if (props.initialOptions) {
            setOptions(props.initialOptions);
        }
    }, [props.initialOptions]);
    const resetOptions = () => {
        setOptions(props.initialOptions || []);
    };

    const handleChange = (selectedOption: Option | null) => {
        setSelectedOption(selectedOption);
        resetOptions();
        if (props.onChange) {
            props.onChange(selectedOption);
        }

        console.log(`Option selected:`, selectedOption);
    };
    const clear = () => {
        console.log('clearing');
        setSelectedOption(null);
        resetOptions();

        if (props.onChange) {
            props.onChange(null);
        }
    };

    const handleInputChange = (inputValue: string) => {
        if (inputValue.length > 40) {
            return;
        }
        const optionExists = options.some(
            (option) => option.value.toLowerCase() === inputValue.toLowerCase()
        );
        const otherOption: Option = { value: inputValue, label: inputValue };
        if (inputValue.length > 0 && !optionExists) {
            setOptions([...options, otherOption]);
        }
    };
    const dropdownClassName = props.className ? styles[props.className] : null;
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

            overflow: 'hidden',
            maxWidth: '300px',
            color: '#bd6160',
        }),
    };
    return (
        <div className={classNames(styles.root, dropdownClassName)}>
            <Select
                styles={customStyles}
                value={props.retrievedSelected || selectedOption}
                onChange={handleChange}
                isClearable
                isSearchable
                placeholder={props.place_holder || 'Select or enter an option ...'}
                onInputChange={handleInputChange}
                options={options}
            />
        </div>
    );
});
