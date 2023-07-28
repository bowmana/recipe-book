import classNames from 'classnames';
import styles from './item-form.module.scss';
import React from 'react';
import { useState } from 'react';
import { Dropdown } from '../util-components/dropdown';
import { Option } from '../types';

export interface InstructionFormProps {
    className?: string;
    addRecipeInstruction: (instruction: string) => void;
}

export const InstructionForm = ({
    className,

    addRecipeInstruction,
}: InstructionFormProps & any) => {
    const [instruction, setInstruction] = useState('' as string);

    const handleSubmitInstruction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!instruction) {
            alert('Please enter an instruction');
            //make this a modal of some sort
            return;
        }

        addRecipeInstruction(instruction);

        setInstruction('');
    };

    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles['recipe-card-line-separator']}> </div>
            <form className={styles['instructions-form']} onSubmit={handleSubmitInstruction}>
                <h2>Add Instructions</h2>
                <textarea
                    className={styles['text-area']}
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="add instruction"
                />
                <button className={styles['add-recipe-instruction']}>Add Instruction</button>
            </form>
        </div>
    );
};
