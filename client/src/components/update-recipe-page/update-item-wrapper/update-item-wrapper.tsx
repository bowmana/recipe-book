import classNames from 'classnames';
import styles from './update-item-wrapper.module.scss';
import { UpdateItemForm } from '../update-item-form/update-item-form';
import { UpdateItem } from '../update-item/update-item';
import { UpdateSavedItem } from '../update-saved-item/update-saved-item';
import { UpdateEditItemForm } from '../update-edit-item-form/update-edit-item-form';
import { useParams } from 'react-router-dom';

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
 * 

*/ //pass in the recipe as a prop
export const UpdateItemWrapper = ({ className }: ItemWrapperProps) => {
    const { id } = useParams<{ id: string }>();
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

    const updateRecipe = async () => {
        await axios
            .post('http://localhost:4000/edit-recipe', {
                id,
                recipe_name,
                recipe_items,
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
            <Link to="/" className={styles['update-recipe']} onClick={updateRecipe}>
                {' '}
                Update{' '}
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
            <UpdateItemForm addRecipeItem={addRecipeItem} />
            {recipe_items.map((item, index) =>
                item.isEditing ? (
                    <UpdateEditItemForm key={index} editRecipeItem={saveRecipeItem} item={item} />
                ) : (
                    <UpdateItem
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
