import classNames from 'classnames';
import styles from './edit-instruction-form.module.scss';

import React from 'react';
import { useState } from 'react';

import { Option } from '../types';

export interface EditInstructionFormProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-item-forms-and-templates
 */
export const EditInstructionForm = ({
    className,
    editRecipeInstruction,
    item,
}: EditInstructionFormProps & any) => {
    const [recipe_instruction, setRecipeInstruction] = useState(item.instruction as string);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        editRecipeInstruction(recipe_instruction, item.instruction_id);
        setRecipeInstruction('');
    };

    return (
        <div className={classNames(styles.root, className)}>
            <form className={styles['item-form']} onSubmit={handleSubmit}>
                <textarea
                    className={styles['input-box']}
                    // type="text"
                    onChange={(e) => setRecipeInstruction(e.target.value)}
                    placeholder="update instruction"
                    value={recipe_instruction}
                />

                <button className={styles['update-recipe-instruction']}>Update</button>
            </form>
        </div>
    );
};
