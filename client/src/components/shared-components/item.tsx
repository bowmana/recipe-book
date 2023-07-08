import classNames from 'classnames';
import styles from './item.module.scss';

import React from 'react';
import { EditableRecipeItem } from '../types';
export interface ItemProps {
    className?: string;
}

export const Item = ({
    className,
    recipe_item,
    deleteRecipeItem,
    editRecipeItem,
    index,
}: ItemProps & EditableRecipeItem & { index: number } & any) => {
    return (
        <div className={classNames(styles.root, className)}>
            <ul className={styles['recipe-ingredients-list']}>
                <li
                    className={
                        index % 2 === 0 ? styles['recipe-item-even'] : styles['recipe-item-odd']
                    }
                    key={index}
                >
                    <h3>{recipe_item.recipe_item}</h3>
                    <h3>{recipe_item.portion_size}</h3>
                    <button
                        className={
                            index % 2 === 0
                                ? styles['delete-recipe-item-even']
                                : styles['delete-recipe-item-odd']
                        }
                        onClick={() => deleteRecipeItem(recipe_item.recipe_item_id)}
                    >
                        delete
                    </button>
                    <button
                        className={
                            index % 2 === 0
                                ? styles['edit-recipe-item-even']
                                : styles['edit-recipe-item-odd']
                        }
                        onClick={() => editRecipeItem(recipe_item.recipe_item_id)}
                    >
                        edit
                    </button>
                </li>
            </ul>
        </div>
    );
};
