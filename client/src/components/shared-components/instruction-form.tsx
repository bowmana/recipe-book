import classNames from 'classnames';
import styles from './instruction-form.module.scss';
import React from 'react';
import { useState } from 'react';

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

    const handleInstruction = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= 250) {
            setInstruction(value);
        } else {
            setInstruction(value.substring(0, 250));
        }
    };

    return (
        <div className={classNames(styles.root, className)}>
            <form className={styles['instructions-form']} onSubmit={handleSubmitInstruction}>
                <h2>Add Instructions</h2>
                <textarea
                    className={styles['text-area']}
                    value={instruction}
                    onChange={(e) => handleInstruction(e)}
                    placeholder="add instruction"
                />
                <div className={styles['description-count']}>{instruction.length}/250</div>
                <button className={styles['add-recipe-instruction']}>Add Instruction</button>
            </form>
        </div>
    );
};
