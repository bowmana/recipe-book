import classNames from 'classnames';
import styles from './item.module.scss';

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
            <ul className={styles['recipe-ingredients-list']}>
                <li
                    className={
                        index % 2 === 0 ? styles['recipe-item-even'] : styles['recipe-item-odd']
                    }
                    key={index}
                >
                    <h3>{recipe_instruction.instruction}</h3>
                    <h3>{index + 1}</h3>
                    <button
                        className={
                            index % 2 === 0
                                ? styles['delete-recipe-item-even']
                                : styles['delete-recipe-item-odd']
                        }
                        onClick={() => deleteRecipeInstruction(recipe_instruction.instruction_id)}
                    >
                        delete
                    </button>
                    <button
                        className={
                            index % 2 === 0
                                ? styles['edit-recipe-item-even']
                                : styles['edit-recipe-item-odd']
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
