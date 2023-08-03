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
    showDescriptionForm: boolean;
    setRecipeDescription: (recipe_description: string) => void;
    recipe_description: string;
}

export const ItemForm = ({
    className,
    addRecipeItem,
    addRecipeDescription,
    showDescriptionForm,
    setRecipeDescription,
    recipeDescription,
}: ItemFormProps & any) => {
    const [recipe_item, setRecipeItem] = useState('' as string);

    const [portion, setPortion] = useState<Option | null>(null);
    // const [recipe_description, setRecipeDescription] = useState('' as string);

    const handleSubmitItem = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!recipe_item) {
            alert('Please enter an ingredient');
            //make this a modal of some sort
            return;
        }
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
    const handleItem = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= 50) {
            setRecipeItem(value);
        } else {
            setRecipeItem(value.substring(0, 50));
        }
    };

    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles['form-wrapper']}>
                <div className={styles['description']}>
                    {showDescriptionForm && (
                        <>
                            <div className={styles['description-form']}>
                                <h2>Add Description</h2>
                                <textarea
                                    value={recipeDescription}
                                    onChange={handleDescription}
                                    placeholder="Add description"
                                />
                                <div className={styles['description-count']}>
                                    {recipeDescription.length}/1000
                                </div>
                            </div>
                            <div className={'line-separator'}> </div>
                        </>
                    )}
                </div>
                <form className={styles['item-form']} onSubmit={handleSubmitItem}>
                    <h2>
                        Add ingredients <span className={'required-text'}>*</span>
                    </h2>

                    <div className={styles['input-container']}>
                        <input
                            className={styles['input-box']}
                            type="text"
                            onChange={(e) => handleItem(e)}
                            placeholder="Add ingredient name"
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
                            place_holder="Enter or Select portion"
                        />
                    </div>

                    <button className={styles['add-recipe-item']}>Add Ingredient</button>
                </form>
            </div>
            <div className={'line-separator'}> </div>
        </div>
    );
};
