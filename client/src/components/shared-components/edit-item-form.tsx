import classNames from 'classnames';
import styles from './edit-item-form.module.scss';

import React from 'react';
import { useState } from 'react';
import { Dropdown } from '../util-components/dropdown';

export interface EditItemFormProps {
    className?: string;
}
interface Option {
    value: string;
    label: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-item-forms-and-templates
 */
export const EditItemForm = ({ className, editRecipeItem, item }: EditItemFormProps & any) => {
    const [recipe_item, setRecipeItem] = useState(item.recipe_item as string);
    const [portion, setPortion] = useState<Option | null>({
        value: item.portion_size,
        label: item.portion_size,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        editRecipeItem(recipe_item, portion?.value, item.recipe_item_id);
        setRecipeItem('');
    };

    const addRecipePortion = (recipe_portion: Option | null) => {
        console.log(recipe_portion, 'add recipe portion');
        setPortion(recipe_portion);
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
                <Dropdown
                    className={styles['portion-dropdown']}
                    initialOptions={[
                        { value: 'cup', label: 'cup' },
                        { value: 'tbsp', label: 'tbsp' },
                        { value: 'tsp', label: 'tsp' },
                    ]}
                    onChange={addRecipePortion}
                />

                <button className={styles['add-recipe-item']}>Update</button>
            </form>
        </div>
    );
};
