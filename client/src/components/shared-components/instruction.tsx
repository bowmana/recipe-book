import classNames from 'classnames';
import styles from './instruction.module.scss';

import React from 'react';
import { EditableInstruction } from '../types';
export interface InstructionProps {
    className?: string;
}

export const Instruction = ({
    className,
    recipe_instruction,
    deleteRecipeInstruction,
    editRecipeInstruction,
    index,
}: InstructionProps & EditableInstruction & any) => {
    return (
        <div className={classNames(styles.root, className)}>
            <ul className={styles['recipe-instructions-list']}>
                <li
                    className={
                        index % 2 === 0
                            ? styles['recipe-instruction-even']
                            : styles['recipe-instruction-odd']
                    }
                    key={index}
                >
                    <span className={styles['recipe-instruction']}>
                        <h3>
                            {index + 1}) {recipe_instruction.instruction}
                        </h3>
                    </span>
                    <button
                        className={
                            index % 2 === 0
                                ? styles['delete-recipe-instruction-even']
                                : styles['delete-recipe-instruction-odd']
                        }
                        onClick={() => deleteRecipeInstruction(recipe_instruction.instruction_id)}
                    >
                        delete
                    </button>
                    <button
                        className={
                            index % 2 === 0
                                ? styles['edit-recipe-instruction-even']
                                : styles['edit-recipe-instruction-odd']
                        }
                        onClick={() => editRecipeInstruction(recipe_instruction.instruction_id)}
                    >
                        edit
                    </button>
                </li>
            </ul>
        </div>
    );
};
