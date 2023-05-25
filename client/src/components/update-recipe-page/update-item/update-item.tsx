import classNames from 'classnames';
import styles from './update-item.module.scss';

import React from 'react';

export interface ItemProps {
    className?: string;
}
interface RecipeItem {
    recipe_item_id: number;
    recipe_item: string;
    isEditing: boolean;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-items-and-templates
 */
export const UpdateItem = ({
    className,
    recipe_item,
    deleteRecipeItem,
    editRecipeItem,
}: ItemProps & RecipeItem & any) => {
    return (
        <div className={classNames(styles.root, className)}>
            <ul>
                <li className={styles['recipe-item']}>
                    <h3>{recipe_item.recipe_item}</h3>
                    <button onClick={() => deleteRecipeItem(recipe_item.recipe_item_id)}>
                        delete
                    </button>
                    <button onClick={() => editRecipeItem(recipe_item.recipe_item_id)}>edit</button>
                </li>
            </ul>
        </div>
    );
};
