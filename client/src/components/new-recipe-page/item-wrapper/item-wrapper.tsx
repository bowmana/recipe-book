import classNames from 'classnames';
import styles from './item-wrapper.module.scss';
import { ItemForm } from '../item-form/item-form';
import { Item } from '../item/item';
import { SavedItem } from '../saved-item/saved-item';
import { EditItemForm } from '../edit-item-form/edit-item-form';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import axios, { AxiosError, AxiosResponse } from 'axios';

export interface ItemWrapperProps {
    className?: string;
}
interface RecipeItem {
    id: string;
    recipe_item: string;
    isEditing: boolean;
}

interface Recipe {
    id: string;
    recipe_name: string;
    recipe_items: RecipeItem[];
}

interface RecipeList {
    recipes: Recipe[];
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-item-wrappers-and-templates
 */
export const ItemWrapper = ({ className }: ItemWrapperProps) => {
    const [recipe_items, setRecipeItems] = useState<RecipeItem[]>([]);
    const [recipe_name, setRecipeName] = useState<string>('');

    const addRecipeItem = (recipe_item: string) => {
        const newItem: RecipeItem = { id: Date.now().toString(), recipe_item, isEditing: false };
        setRecipeItems([...recipe_items, newItem]);

        console.log(recipe_items);
    };

    const deleteRecipeItem = (id: string) => {
        const updatedRecipeItems = recipe_items.filter((item) => item.id !== id);
        setRecipeItems(updatedRecipeItems);
    };

    const editRecipeItem = (id: string) => {
        setRecipeItems(
            recipe_items.map((item: RecipeItem) => {
                return item.id === id
                    ? {
                          ...item,
                          isEditing: !item.isEditing,
                      }
                    : item;
            })
        );
    };

    const saveRecipeItem = (recipe_item: string, id: string) => {
        setRecipeItems(
            recipe_items.map((item: RecipeItem) => {
                return item.id === id
                    ? {
                          ...item,
                          recipe_item,
                          isEditing: !item.isEditing,
                      }
                    : item;
            })
        );
    };

    const saveRecipe = async () => {
        // setIsSaved(true);

        await axios
            .post('http://localhost:4000/recipes', {
                recipe_name: recipe_name,
                recipe_items: recipe_items,
            })
            .then((response: AxiosResponse) => {
                console.log(response);
            })
            .catch((error: AxiosError) => {
                console.log(error);
            });
    };

    const clearRecipe = () => {
        setRecipeItems([]);
    };

    const updateName = (e: any) => {
        setRecipeName(e.target.value);
    };

    return (
        <div className={classNames(styles.root, className)}>
            <Link to="/" className={styles['save-recipe']} onClick={saveRecipe}>
                {' '}
                Save{' '}
            </Link>
            <button className={styles['delete-recipe']} onClick={clearRecipe}>
                Clear
            </button>
            <form>
                <label>
                    Recipe Name:
                    <input type="text" name="name" onChange={updateName} />
                </label>
            </form>
            <h1>Add Items To {recipe_name}</h1>
            <ItemForm addRecipeItem={addRecipeItem} />
            {recipe_items.map((item, index) =>
                item.isEditing ? (
                    <EditItemForm key={index} editRecipeItem={saveRecipeItem} item={item} />
                ) : (
                    <Item
                        recipe_item={item}
                        key={index}
                        deleteRecipeItem={deleteRecipeItem}
                        editRecipeItem={editRecipeItem}
                    />
                )
            )}
        </div>
    );
};