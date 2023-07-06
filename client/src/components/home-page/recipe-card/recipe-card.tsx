import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './recipe-card.module.scss';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ImageCycle } from '../../util-components/imagecycle';
import { Dropdown } from '../../util-components/dropdown';

export interface RecipeCardProps {
    className?: string;
    onRecipeDelete: () => void;
    user_id: number;
}
interface Option {
    value: string;
    label: string;
}

interface RecipeItem {
    recipe_item: string;
    portion_size: string;
    recipe_item_id: number;
}

interface Recipe {
    recipe_items: RecipeItem[];
    recipe_id: number;
    recipe_name: string;
    recipe_cuisine: string;
    recipe_type: string;
    recipe_description: string;
    recipe_images: string[];
}

interface RecipeCardPropsWithRecipes extends RecipeCardProps {
    recipes: Recipe[];
}

const RecipeCard = ({
    className,
    recipes,
    onRecipeDelete,
    user_id,
}: RecipeCardPropsWithRecipes) => {
    const [searchRecipeName, setSearchRecipeName] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [recipe_cuisine, setRecipeCuisine] = useState<Option | null>(null);
    const [recipe_type, setRecipeType] = useState<Option | null>(null);
    useEffect(() => {
        handleSearch();
    }, []);
    const handleSearch = async () => {
        const recipe_name = searchRecipeName.toLowerCase();
        try {
            const response = await axios.get(`http://localhost:4000/${user_id}/cacheData`, {
                params: {
                    recipe_name: recipe_name,
                    recipe_cuisine: recipe_cuisine?.value,
                    recipe_type: recipe_type?.value,
                },
            });
            setFilteredRecipes(response.data);
        } catch (error) {
            console.log(error);
        }
    };
    const clearSearch = () => {
        setSearchRecipeName('');
        setFilteredRecipes([]);
    };

    const deleteRecipe = async (recipe_id: number) => {
        await axios
            .delete(`http://localhost:4000/recipes/${user_id}/delete/${recipe_id}`)
            .then((response) => {
                onRecipeDelete();
                console.log(response);
                const updatedRecipes = recipes.filter((recipe) => recipe.recipe_id !== recipe_id);
                setFilteredRecipes(updatedRecipes);
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const addRecipeCuisine = (recipe_cuisine: Option | null) => {
        setRecipeCuisine(recipe_cuisine);
    };

    const addRecipeType = (recipe_type: Option | null) => {
        setRecipeType(recipe_type);
    };

    return (
        <div className={classNames(styles.root, className)}>
            <h1>Recipes</h1>
            <div className={styles['search-container']}>
                <div className={styles['search-bar']}>
                    <input
                        type="text"
                        placeholder="Search by name, cuisine, or meal category"
                        value={searchRecipeName}
                        onChange={(e) => setSearchRecipeName(e.target.value)}
                    />

                    <div className={styles['recipe-genre-dropdown']}>
                        <h1 className={styles['pick-a-text']}>Search by recipe cuisine</h1>
                        <div className={styles['dropdown-container']}>
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
                        </div>
                        <h1 className={styles['pick-a-text']}>Search by recipe type</h1>
                        <div className={styles['dropdown-container']}>
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
                    </div>
                    <div className={styles['search-buttons']}>
                        <button onClick={() => handleSearch()}>Search</button>
                        <button onClick={() => clearSearch()}>Clear</button>
                    </div>
                </div>
            </div>

            {(recipes.length > 0 || filteredRecipes.length > 0
                ? filteredRecipes.length > 0
                    ? filteredRecipes
                    : recipes
                : []
            ).map((recipe) => {
                return (
                    <div className={styles['recipe-card']}>
                        <li className={styles['recipe-card-li']} key={recipe.recipe_id}>
                            <div className={styles['recipe-card-header']}>
                                <h2>{recipe.recipe_name}</h2>
                                <h3>Cuisine: {recipe.recipe_cuisine}</h3>
                                <h3>Meal Category: {recipe.recipe_type}</h3>
                            </div>
                            <div className={styles['recipe-card-line-separator']}> </div>
                            <div className={styles['recipe-card-content']}>
                                <div className={styles['recipe-card-buttons']}>
                                    <Link
                                        to={`/update-recipe/${recipe.recipe_id}`}
                                        className={styles['edit-recipe']}
                                    >
                                        {' '}
                                        edit{' '}
                                    </Link>

                                    <button
                                        className={styles['delete-recipe']}
                                        onClick={() => {
                                            deleteRecipe(recipe.recipe_id);
                                        }}
                                    >
                                        {' '}
                                        delete{' '}
                                    </button>
                                </div>
                                <ImageCycle imageUrls={recipe.recipe_images} />
                            </div>
                            <ul className={styles['recipe-card-ingredients']}>
                                {recipe.recipe_items.map((item: RecipeItem) => {
                                    return (
                                        <li key={item.recipe_item_id}>
                                            <h3 className={styles['recipe-card-item']}>
                                                {item.recipe_item}
                                            </h3>
                                            <h3 className={styles['recipe-card-portion']}>
                                                {item.portion_size}
                                            </h3>
                                        </li>
                                    );
                                })}
                            </ul>{' '}
                            <div className={styles['recipe-card-line-separator']}> </div>
                            <div className={styles['recipe-card-description']}>
                                <h3>{recipe.recipe_description}</h3>
                            </div>
                            <div className={styles['recipe-card-bottom']}> </div>
                        </li>
                    </div>
                );
            })}
        </div>
    );
};

export default RecipeCard;
