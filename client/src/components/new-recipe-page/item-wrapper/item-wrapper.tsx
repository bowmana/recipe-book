import classNames from 'classnames';
import styles from './item-wrapper.module.scss';
import { ItemForm } from '../item-form/item-form';
import { Item } from '../item/item';
import { SavedItem } from '../saved-item/saved-item';
import { EditItemForm } from '../edit-item-form/edit-item-form';
import { ImageUpload } from '../../util-components/imageupload';
import { v4 as UUID } from 'uuid';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from '../../util-components/dropdown';

import axios, { AxiosError, AxiosResponse } from 'axios';

export interface ItemWrapperProps {
    className?: string;
}
interface RecipeItem {
    recipe_item_id: string;
    recipe_item: string;
    isEditing: boolean;
}
interface Option {
    value: string;
    label: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-item-wrappers-and-templates
 */
export const ItemWrapper = ({ className }: ItemWrapperProps) => {
    const [user_id, setUserID] = useState(0);

    useEffect(() => {
        const auth = async () => {
            const url =
                process.env.NODE_ENV === 'production'
                    ? 'http://localhost:4001/auth' // Change if actually deployed to real web server
                    : 'http://localhost:4001/auth';

            await axios
                .post(url, {}, { withCredentials: true })
                .then((axiosResponse: AxiosResponse) => {
                    setUserID(axiosResponse.data.user_id);
                })
                .catch((axiosError: AxiosError) => {
                    window.location.href = '/login';
                });
        };

        auth();
    }, []);

    const [recipe_items, setRecipeItems] = useState<RecipeItem[]>([]);
    const [recipe_name, setRecipeName] = useState<string>('');
    const [recipe_cuisine, setRecipeCuisine] = useState<Option | null>(null);
    const [recipe_type, setRecipeType] = useState<Option | null>(null);
    const [images, setImages] = useState<File[]>([]);

    const addRecipeItem = (recipe_item: string) => {
        const newItem: RecipeItem = { recipe_item_id: UUID(), recipe_item, isEditing: false };
        setRecipeItems([...recipe_items, newItem]);

        console.log(recipe_items);
    };

    const addRecipeCuisine = (recipe_cuisine: Option | null) => {
        setRecipeCuisine(recipe_cuisine);
    };

    const addRecipeType = (recipe_type: Option | null) => {
        setRecipeType(recipe_type);
    };

    const deleteRecipeItem = (id: string) => {
        const updatedRecipeItems = recipe_items.filter((item) => item.recipe_item_id !== id);
        setRecipeItems(updatedRecipeItems);
    };

    const editRecipeItem = (id: string) => {
        setRecipeItems(
            recipe_items.map((item: RecipeItem) => {
                return item.recipe_item_id === id
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
                return item.recipe_item_id === id
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
        const formData = new FormData();

        images.forEach((image) => {
            formData.append('recipe_images', image);
        });
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };

        formData.append('recipe_name', recipe_name);

        formData.append('recipe_cuisine', recipe_cuisine ? recipe_cuisine.value : '');
        formData.append('recipe_type', recipe_type ? recipe_type.value : '');
        try {
            const response = await axios.post(
                `http://localhost:4000/${user_id}/recipes`,
                formData,

                config
            );
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    };

    const clearRecipe = () => {
        setRecipeItems([]);
    };

    const updateName = (e: any) => {
        setRecipeName(e.target.value);
    };

    return (
        <div className={classNames(styles.root, className)}>
            <Link to="/home" className={styles['save-recipe']} onClick={saveRecipe}>
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
            <ImageUpload maxImages={5} addImages={setImages} />
            <div className={styles['recipe-genre-dropdown']}>
                <Dropdown
                    initialOptions={[
                        { value: 'Italian', label: 'Italian' },
                        { value: 'Mexican', label: 'Mexican' },
                        { value: 'American', label: 'American' },
                        { value: 'French', label: 'French' },
                        { value: 'Chinese', label: 'Chinese' },
                        { value: 'Japanese', label: 'Japanese' },
                        { value: 'Indian', label: 'Indian' },
                        { value: 'Thai', label: 'Thai' },
                        { value: 'Spanish', label: 'Spanish' },
                        { value: 'Greek', label: 'Greek' },
                        { value: 'Lebanese', label: 'Lebanese' },
                        { value: 'Moroccan', label: 'Moroccan' },
                        { value: 'Brazilian', label: 'Brazilian' },
                        { value: 'Korean', label: 'Korean' },
                        { value: 'Vietnamese', label: 'Vietnamese' },
                        { value: 'Turkish', label: 'Turkish' },
                        { value: 'German', label: 'German' },
                        { value: 'Ethiopian', label: 'Ethiopian' },
                        { value: 'Peruvian', label: 'Peruvian' },
                        { value: 'Russian', label: 'Russian' },
                        { value: 'Jamaican', label: 'Jamaican' },
                        { value: 'Egyptian', label: 'Egyptian' },
                        { value: 'British', label: 'British' },
                        { value: 'Israeli', label: 'Israeli' },
                        { value: 'Indonesian', label: 'Indonesian' },
                        { value: 'Irish', label: 'Irish' },
                        { value: 'Argentine', label: 'Argentine' },
                        { value: 'Swedish', label: 'Swedish' },
                        { value: 'Australian', label: 'Australian' },
                        { value: 'Malaysian', label: 'Malaysian' },
                    ]}
                    onChange={addRecipeCuisine}
                />
                <Dropdown
                    initialOptions={[
                        { value: 'Breakfast', label: 'Breakfast' },
                        { value: 'Lunch', label: 'Lunch' },
                        { value: 'Dinner', label: 'Dinner' },
                        { value: 'Dessert', label: 'Dessert' },
                        { value: 'Snack', label: 'Snack' },
                        { value: 'Appetizer', label: 'Appetizer' },
                        { value: 'Drink', label: 'Drink' },
                        { value: 'Side', label: 'Side' },
                        { value: 'Sauce', label: 'Sauce' },
                        { value: 'Marinade', label: 'Marinade' },
                    ]}
                    onChange={addRecipeType}
                />
            </div>
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
