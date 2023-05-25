import classNames from 'classnames';
import styles from './update-item-form.module.scss';
import React from 'react';
import { useState } from 'react';

export interface ItemFormProps {
    className?: string;
}

export const UpdateItemForm = ({ className, addRecipeItem }: ItemFormProps & any) => {
    const [recipe_item, setRecipeItem] = useState('' as string);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addRecipeItem(recipe_item);
        setRecipeItem('');
    };

    return (
        <div className={classNames(styles.root, className)}>
            <form className={styles['item-form']} onSubmit={handleSubmit}>
                <input
                    className={styles['input-box']}
                    type="text"
                    onChange={(e) => setRecipeItem(e.target.value)}
                    placeholder="add ingredient"
                    value={recipe_item}
                />
                <button className={styles['add-recipe-item']}>Add Ingredient</button>
            </form>
        </div>
    );
};
