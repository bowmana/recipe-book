import classNames from 'classnames';
import styles from './item-wrapper.module.scss';
import { ItemForm } from '../item-form/item-form';
import { Item } from '../item/item';
import { SavedItem } from '../saved-item/saved-item';
import { EditItemForm } from '../edit-item-form/edit-item-form';
import global from '../../components/globalJSON/global.json';
import { useState } from 'react';

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
    recipe: string;
    recipe_items: RecipeItem[];
}

interface RecipeList {
    recipes: Recipe[];
}
//make global of type RecipeList
const globalRecipeList: RecipeList = global;

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-item-wrappers-and-templates
 */
export const ItemWrapper = ({ className }: ItemWrapperProps) => {
    const [recipe_items, setRecipeItems] = useState<RecipeItem[]>([]);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [isDeleted, setIsDeleted] = useState<boolean>(false);

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

    const saveRecipe = () => {
        const newRecipe: Recipe = {
            id: Date.now().toString(),
            recipe: 'new recipe',
            recipe_items: recipe_items,
        };
        globalRecipeList.recipes.push(newRecipe);
        setIsSaved(true);
        console.log(globalRecipeList);
    };

    const clearRecipe = () => {
        setRecipeItems([]);

        const recipeIdToDelete = globalRecipeList.recipes[0].id; // replace this with the actual recipe id to delete
        const updatedRecipes = globalRecipeList.recipes.filter(
            (recipe) => recipe.id !== recipeIdToDelete
        );
        globalRecipeList.recipes = updatedRecipes;
        setIsSaved(false);
        console.log(globalRecipeList);
    };

    const editRecipe = () => {
        setIsSaved(false);
    };

    return (
        <div className={classNames(styles.root, className)}>
            {!isSaved ? (
                <>
                    <button className={styles['save-recipe']} onClick={saveRecipe}>
                        Save
                    </button>
                    <button className={styles['delete-recipe']} onClick={clearRecipe}>
                        Clear
                    </button>
                    <h1>Add Items To Recipe</h1>
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
                </>
            ) : (
                //if isSaved is true, show data without buttons
                <>
                    <button className={styles['edit-recipe']} onClick={editRecipe}>
                        Edit
                    </button>
                    <button className={styles['delete-recipe']} onClick={clearRecipe}>
                        Clear
                    </button>
                    <h1>Recipe Saved</h1>
                    <h2>Recipe Name: {globalRecipeList.recipes[0].recipe}</h2>
                    <h2>Recipe Items:</h2>
                    {recipe_items.map((item, index) => (
                        <SavedItem recipe_item={item} key={index} />
                    ))}
                </>
            )}
        </div>
    );
};
