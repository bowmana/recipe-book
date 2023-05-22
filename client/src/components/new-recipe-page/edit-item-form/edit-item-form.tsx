import classNames from 'classnames';
import styles from './edit-item-form.module.scss';

import React from 'react';
import { useState } from 'react';

export interface EditItemFormProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-item-forms-and-templates
 */
export const EditItemForm = ({ className, editRecipeItem, item }: EditItemFormProps & any) => {
    const [recipe_item, setRecipeItem] = useState(item.recipe_item as string);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        editRecipeItem(recipe_item, item.recipe_item_id);
        setRecipeItem('');
    };
    return (
        <div className={classNames(styles.root, className)}>
            <form className={styles['item-form']} onSubmit={handleSubmit}>
                <input
                    className={styles['input-box']}
                    type="text"
                    onChange={(e) => setRecipeItem(e.target.value)}
                    placeholder="update ingredient"
                    value={recipe_item}
                />
                <button className={styles['add-recipe-item']}>Update</button>
            </form>
        </div>
    );
};
