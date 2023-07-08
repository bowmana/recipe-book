import classNames from 'classnames';
import styles from './item-form.module.scss';
import React from 'react';
import { useState } from 'react';
import { Dropdown } from '../util-components/dropdown';
import { Option } from '../types';

export interface ItemFormProps {
    className?: string;
    addRecipeItem: (recipe_item: string, portion_size: string) => void;
    addRecipeDescription: (recipe_description: string) => void;
    recipeDescription: string;
}

export const ItemForm = ({
    className,
    addRecipeItem,
    addRecipeDescription,
    recipeDescription,
}: ItemFormProps & any) => {
    const [recipe_item, setRecipeItem] = useState('' as string);
    //portion is the value of the dropdown
    const [portion, setPortion] = useState<Option | null>(null);
    const [recipe_description, setRecipeDescription] = useState('' as string);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addRecipeItem(recipe_item, portion?.value);

        setRecipeItem('');
    };
    const RecipePortion = (recipe_portion: Option | null) => {
        console.log(recipe_portion, 'add recipe portion');
        setPortion(recipe_portion);
    };
    const handleDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= 1000) {
            setRecipeDescription(value);
            addRecipeDescription(value);
        } else {
            setRecipeDescription(value.substring(0, 1000));
            addRecipeDescription(value.substring(0, 1000));
        }
    };

    return (
        <div className={classNames(styles.root, className)}>
            <form className={styles['item-form']} onSubmit={handleSubmit}>
                <h2>Add description</h2>
                <textarea
                    className={styles['text-area']}
                    value={recipeDescription || recipe_description}
                    onChange={handleDescription}
                    placeholder="add description"
                />
                <h2> Add ingredients</h2>
                <div className={styles['input-container']}>
                    <input
                        className={styles['input-box']}
                        type="text"
                        onChange={(e) => setRecipeItem(e.target.value)}
                        placeholder="add ingredient name"
                        value={recipe_item}
                    />
                    <Dropdown
                        className="portion-dropdown"
                        initialOptions={[
                            { value: 'cup', label: 'Cup' },
                            { value: 'tbsp', label: 'Tablespoon (tbsp)' },
                            { value: 'tsp', label: 'Teaspoon (tsp)' },
                            { value: 'oz', label: 'Ounce (oz)' },
                            { value: 'lb', label: 'Pound (lb)' },
                            { value: 'g', label: 'Gram (g)' },
                            { value: 'kg', label: 'Kilogram (kg)' },
                            { value: 'ml', label: 'Milliliter (ml)' },
                            { value: 'L', label: 'Liter (L)' },
                            { value: 'pt', label: 'Pint (pt)' },
                            { value: 'qt', label: 'Quart (qt)' },
                            { value: 'gal', label: 'Gallon (gal)' },
                            { value: 'piece', label: 'Piece' },
                            { value: 'slice', label: 'Slice' },
                            { value: 'pack', label: 'Pack' },
                            { value: 'bunch', label: 'Bunch' },
                            { value: 'sprig', label: 'Sprig' },
                            { value: 'head', label: 'Head' },
                            { value: 'stalk', label: 'Stalk' },
                            { value: 'pinch', label: 'Pinch' },
                            { value: 'handful', label: 'Handful' },
                            { value: 'drop', label: 'Drop' },
                            { value: 'dash', label: 'Dash' },
                            { value: 'scoop', label: 'Scoop' },
                            { value: 'jar', label: 'Jar' },
                            { value: 'can', label: 'Can' },
                            { value: 'bottle', label: 'Bottle' },
                            { value: 'bar', label: 'Bar' },
                            { value: 'packet', label: 'Packet' },
                            { value: 'box', label: 'Box' },
                            { value: 'bag', label: 'Bag' },
                            { value: 'serving', label: 'Serving' },
                            { value: 'scoop', label: 'Scoop' },
                            { value: 'slice', label: 'Slice' },
                            { value: 'wedge', label: 'Wedge' },
                            { value: 'fillet', label: 'Fillet' },
                            { value: 'strip', label: 'Strip' },
                            { value: 'piece', label: 'Piece' },
                            { value: 'whole', label: 'Whole' },
                            { value: 'portion', label: 'Portion' },
                        ]}
                        onChange={RecipePortion}
                        place_holder="select portion"
                    />
                </div>
                <button className={styles['add-recipe-item']}>Add Ingredient</button>
            </form>
        </div>
    );
};
