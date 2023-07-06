import classNames from 'classnames';
import styles from './update-item-wrapper.module.scss';
import { UpdateItemForm } from '../update-item-form/update-item-form';
import { UpdateItem } from '../update-item/update-item';
import { UpdateSavedItem } from '../update-saved-item/update-saved-item';
import { UpdateEditItemForm } from '../update-edit-item-form/update-edit-item-form';
import { v4 as UUID } from 'uuid';
import { useParams } from 'react-router-dom';
import { Dropdown } from '../../util-components/dropdown';
import { ImageUpload } from '../../util-components/imageupload';
// import { LoadingModal } from '../../util-components/loadingmodal';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import axios, { AxiosError, AxiosResponse } from 'axios';

export interface ItemWrapperProps {
    className?: string;
}
interface RecipeItem {
    recipe_item_id: number | null;
    recipe_item: string;
    portion_size: string;
    isEditing: boolean;
}

interface Recipe {
    recipe_id: number;
    recipe_name: string;
    recipe_items: RecipeItem[];
}
interface Option {
    value: string;
    label: string;
}

export const UpdateItemWrapper = ({ className }: ItemWrapperProps) => {
    const { recipe_id } = useParams<{ recipe_id: string }>();
    const [recipe_items, setRecipeItems] = useState<RecipeItem[]>([]);
    const [recipe_name, setRecipeName] = useState<string>('');
    const [recipe_cuisine, setRecipeCuisine] = useState<Option | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [recipe_type, setRecipeType] = useState<Option | null>(null);
    const [editRecipeCuisine, setEditRecipeCuisine] = useState(false);
    const [editRecipeType, setEditRecipeType] = useState(false);
    const [recipe_images, setRecipeImages] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/recipes/${recipe_id}`);
                console.log(response.data, 'recipe data');
                const fetchedRecipeItems = (response.data.recipe_items || []).map(
                    (item: RecipeItem) => ({
                        recipe_item_id: item.recipe_item_id,
                        recipe_item: item.recipe_item,
                        portion_size: item.portion_size,
                        isEditing: false, // Add the "isEditing" property
                    })
                );
                setRecipeName(response.data.recipe_name);

                setRecipeImages(response.data.recipe_images);

                setRecipeItems(fetchedRecipeItems);
                setRecipeCuisine({
                    value: response.data.recipe_cuisine,
                    label: response.data.recipe_cuisine,
                });
                setRecipeType({
                    value: response.data.recipe_type,
                    label: response.data.recipe_type,
                });

                console.log(response.data, 'response data on update item wrapper');
                // console.log(fetchedRecipeItems);
            } catch (error) {
                console.log('Failed to fetch recipes');
                console.log(error);
            }
        };
        fetchRecipes();
    }, [recipe_id]);

    // const addRecipeItem = async (recipe_item: string) => {
    //     try {
    //         const newItem: RecipeItem = { recipe_item_id: null, recipe_item, isEditing: false };
    //         const response = await axios.post(
    //             `http://localhost:4000/recipes/${recipe_id}/additem`,
    //             {
    //                 recipe_item,
    //             }
    //         );
    //         newItem.recipe_item_id = response.data.recipe_item_id;
    //         setRecipeItems([...recipe_items, newItem]);
    //         console.log(recipe_items, 'new item added');
    //     } catch (error) {
    //         console.log('Failed to add recipe item');
    //         console.log(error);
    //     }
    // };

    const deleteRecipeItem = (id: number) => {
        const updatedRecipeItems = recipe_items.filter((item) => item.recipe_item_id !== id);
        setRecipeItems(updatedRecipeItems);
    };

    const editRecipeItem = (id: number) => {
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

    const saveRecipeItem = (recipe_item: string, recipe_portion: string, id: number) => {
        setRecipeItems(
            recipe_items.map((item: RecipeItem) => {
                return item.recipe_item_id === id
                    ? {
                          ...item,
                          recipe_item,
                          portion_size: recipe_portion,
                          isEditing: !item.isEditing,
                      }
                    : item;
            })
        );
    };

    const updateRecipe = async () => {
        setIsUploading(true);
        const formData = new FormData();

        images.forEach((image) => {
            formData.append('recipe_images', image);
        });
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: any) => {
                const { loaded, total } = progressEvent;
                const percent = Math.floor((loaded * 100) / total);
                setUploadProgress(percent);
            },
        };
        formData.append('recipe_name', recipe_name);
        formData.append('recipe_cuisine', recipe_cuisine?.value || '');
        formData.append('recipe_type', recipe_type?.value || '');
        formData.append('recipe_items', JSON.stringify(recipe_items));

        try {
            console.log(formData, 'yoooooooooooooooo');
            const response = await axios.put(
                `http://localhost:4000/recipes/${recipe_id}`,
                formData,
                config
            );
            window.location.href = '/home';
            setIsUploading(false);
            console.log(response);
        } catch (error) {
            console.log(formData, 'yeeeeeeeeeeeeeeer');
            console.log(error);
            setIsUploading(false);
        }
    };

    const clearRecipe = () => {
        setRecipeItems([]);
    };

    const updateName = (e: any) => {
        setRecipeName(e.target.value);
    };

    const addRecipeCuisine = (recipe_cuisine: Option | null) => {
        setRecipeCuisine(recipe_cuisine);
        toggleEditRecipeCuisine();
    };

    const addRecipeType = (recipe_type: Option | null) => {
        setRecipeType(recipe_type);
        toggleEditRecipeType();
    };
    const toggleEditRecipeCuisine = () => {
        setEditRecipeCuisine(!editRecipeCuisine);
    };

    const toggleEditRecipeType = () => {
        setEditRecipeType(!editRecipeType);
    };

    return (
        <div className={classNames(styles.root, className)}>
            <button className={styles['save-recipe']} onClick={updateRecipe}>
                {' '}
                Update
            </button>
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

            <ImageUpload maxImages={5} addImages={setImages} retrievedImages={recipe_images} />
            <div className={styles['recipe-genre-dropdown']}>
                {editRecipeCuisine ? (
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
                        retrievedSelected={recipe_cuisine}
                    />
                ) : (
                    <div>
                        <span>{recipe_cuisine ? recipe_cuisine.label : ''}</span>
                        <button onClick={toggleEditRecipeCuisine}>Edit</button>
                    </div>
                )}
                {editRecipeType ? (
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
                        retrievedSelected={recipe_type}
                    />
                ) : (
                    <div>
                        <span>{recipe_type ? recipe_type.label : ''}</span>
                        <button onClick={toggleEditRecipeType}>Edit</button>
                    </div>
                )}
            </div>
            {/* <UpdateItemForm addRecipeItem={addRecipeItem} /> */}

            {recipe_items && recipe_items.length > 0 ? (
                recipe_items.map((item, index) =>
                    item.isEditing ? (
                        <UpdateEditItemForm
                            key={index}
                            editRecipeItem={saveRecipeItem}
                            item={item}
                        />
                    ) : (
                        <UpdateItem
                            recipe_item={item}
                            key={index}
                            deleteRecipeItem={deleteRecipeItem}
                            editRecipeItem={editRecipeItem}
                        />
                    )
                )
            ) : (
                <h1>There are no items in this recipe</h1>
            )}
        </div>
    );
};
