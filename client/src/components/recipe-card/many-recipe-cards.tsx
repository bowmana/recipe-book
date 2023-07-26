import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './many-recipe-cards.module.scss';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ImageCycle } from '../util-components/imagecycle';
import { Dropdown } from '../util-components/dropdown';
import { RecipeCard } from '../recipe-card/recipe-card';
import { Recipe, Option } from '../types';

export interface ManyRecipeCardsProps {
    className?: string;
    onRecipeDelete: () => void;
    user_id: number;
    user_name: string;
}

interface RecipeCardPropsWithRecipes extends ManyRecipeCardsProps {
    recipes: Recipe[];
}

const ManyRecipeCards = ({
    className,
    recipes,
    onRecipeDelete,
    user_id,
    user_name,
}: RecipeCardPropsWithRecipes) => {
    const [searchRecipeName, setSearchRecipeName] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [recipe_cuisine, setRecipeCuisine] = useState<Option | null>(null);
    const [recipe_type, setRecipeType] = useState<Option | null>(null);

    const dropDownRef = useRef<any>(null);
    const dropDownRef2 = useRef<any>(null);
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
        dropDownRef.current?.clear();
        dropDownRef2.current?.clear();
        setRecipeCuisine(null);
        setRecipeType(null);
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

    const shareRecipe = async (recipe: Recipe) => {
        try {
            const recipe_id = recipe.recipe_id;
            console.log(recipe_id);

            const response = await axios.post(
                `http://localhost:4000/recipes/${user_id}/share/${recipe_id}`,
                {
                    data: {
                        u_id: user_id,
                        u_name: user_name,
                    },
                }
            );
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={classNames(styles.root, className)}>
            <h1>My Recipes</h1>
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
                                ref={dropDownRef}
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
                                ref={dropDownRef2}
                            />
                        </div>
                    </div>
                    <div className={styles['search-buttons']}>
                        <button onClick={() => handleSearch()}>Search</button>
                        <button onClick={() => clearSearch()}>Clear</button>
                    </div>
                </div>
            </div>

            {recipes.length > 0 || filteredRecipes.length > 0
                ? (filteredRecipes.length > 0 ? filteredRecipes : recipes).map((recipe) => (
                      <>
                          <RecipeCard
                              recipe={recipe}
                              deleteRecipe={deleteRecipe}
                              currentUserId={user_id}
                          />
                          {recipe.shared === false && recipe.u_id === user_id && (
                              <button
                                  className={styles['share-button']}
                                  onClick={() => shareRecipe(recipe)}
                              >
                                  Share
                              </button>
                          )}
                      </>
                  ))
                : null}
        </div>
    );
};

export default ManyRecipeCards;
