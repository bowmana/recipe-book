import classNames from 'classnames';
import styles from './item-wrapper.module.scss';
import { ItemForm } from '../item-form/item-form';
import { Item } from '../item/item';
import { SavedItem } from '../saved-item/saved-item';
import { EditItemForm } from '../edit-item-form/edit-item-form';
import { ImageUpload } from '../../util-components/imageupload';
import { v4 as UUID } from 'uuid';
import defaultImage from '../../../assets/images/default.png';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from '../../util-components/dropdown';
import { LoadingModal } from '../../util-components/loadingmodal';

import axios, { AxiosError, AxiosResponse } from 'axios';
import { url } from 'inspector';

export interface ItemWrapperProps {
    className?: string;
}
interface RecipeItem {
    recipe_item_id: string;
    recipe_item: string;
    portion_size: string;
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
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [recipe_description, setRecipeDescription] = useState<string>('');

    const addRecipeItem = (recipe_item: string, portion_size: string) => {
        const newItem: RecipeItem = {
            recipe_item_id: UUID(),
            recipe_item,
            portion_size,
            isEditing: false,
        };
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

    const addRecipeDescription = (recipe_description: string) => {
        setRecipeDescription(recipe_description);
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

    const saveRecipeItem = (recipe_item: string, recipe_portion: string, id: string) => {
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

    const saveRecipe = async () => {
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

        recipe_items.forEach((item, index) => {
            formData.append(`recipe_items[${index}][recipe_item]`, item.recipe_item);
            formData.append(`recipe_items[${index}][portion_size]`, item.portion_size);
        });

        formData.append('recipe_name', recipe_name);

        formData.append('recipe_cuisine', recipe_cuisine ? recipe_cuisine.value : '');
        formData.append('recipe_type', recipe_type ? recipe_type.value : '');
        formData.append('recipe_description', recipe_description ? recipe_description : '');
        try {
            const response = await axios.post(
                `http://localhost:4000/${user_id}/recipes`,
                formData,
                config
            );
            window.location.href = '/home';
            setIsUploading(false);
            console.log(response);
        } catch (error) {
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

    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles['recipe-card']}>
                <div className={styles['recipe-card-header']}>
                    <form>
                        <label>
                            Recipe Name:
                            <input type="text" name="name" onChange={updateName} />
                        </label>
                    </form>
                    <button className={styles['recipe-card-buttons']} onClick={saveRecipe}>
                        Save
                    </button>
                    <button className={styles['recipe-card-buttons']} onClick={clearRecipe}>
                        Clear
                    </button>
                </div>

                {isUploading && (
                    <div className={styles['upload-progress']}>
                        <LoadingModal
                            uploadProgress={uploadProgress}
                            isOpen={isUploading}
                            onRequestclose={() => {}}
                        />
                    </div>
                )}
                <div className={styles['recipe-card-line-separator']}> </div>

                <ImageUpload maxImages={5} addImages={setImages} initialImage={defaultImage} />
                <div className={styles['recipe-card-line-separator']}> </div>

                <div className={styles['recipe-genre-dropdown']}>
                    <div className={styles['dropdown-container']}>
                        <h2> Pick a Cuisine </h2>
                        <Dropdown
                            className="cuisine-dropdown"
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
                            place_holder="Select a cuisine"
                        />
                    </div>

                    <div className={styles['dropdown-container']}>
                        <h2>Pick a recipe type </h2>
                        <Dropdown
                            className="type-dropdown"
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
                            place_holder="Select a recipe type"
                        />
                    </div>
                </div>
                <div className={styles['recipe-card-line-separator']}> </div>
                <div className={styles['form-container']}>
                    <ItemForm
                        addRecipeItem={addRecipeItem}
                        addRecipeDescription={addRecipeDescription}
                    />

                    {recipe_items.map((item, index) =>
                        item.isEditing ? (
                            <EditItemForm key={index} editRecipeItem={saveRecipeItem} item={item} />
                        ) : (
                            <Item
                                recipe_item={item}
                                index={index}
                                deleteRecipeItem={deleteRecipeItem}
                                editRecipeItem={editRecipeItem}
                            />
                        )
                    )}
                    <div className={styles['recipe-card-bottom']}> </div>
                </div>
            </div>
        </div>
    );
};
