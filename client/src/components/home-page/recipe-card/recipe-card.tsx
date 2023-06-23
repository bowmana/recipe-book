import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './recipe-card.module.scss';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ImageCycle } from '../../util-components/imagecycle';

export interface RecipeCardProps {
    className?: string;
    onRecipeDelete: () => void;
    user_id: number;
}

interface RecipeItem {
    recipe_item: string;
    recipe_item_id: number;
}

interface Recipe {
    recipe_items: RecipeItem[];
    recipe_id: number;
    recipe_name: string;
    recipe_cuisine: string;
    recipe_type: string;
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
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const handleSearch = () => {
        // Filter the recipes based on the search query

        const query = searchQuery.toLowerCase();
        const fRecipes = recipes.filter(
            (recipe) =>
                recipe.recipe_name.toLowerCase().includes(query) ||
                recipe.recipe_cuisine.toLowerCase().includes(query) ||
                recipe.recipe_type.toLowerCase().includes(query)
        );
        setFilteredRecipes(fRecipes);
    };
    const clearSearch = () => {
        setSearchQuery('');
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

    return (
        <div className={classNames(styles.root, className)}>
            <h1>Recipes</h1>
            <div className={styles['search-bar']}>
                <input
                    type="text"
                    placeholder="Search by name, cuisine, or meal category"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => handleSearch()}>Search</button>
                <button onClick={() => clearSearch()}>Clear</button>
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
                                        </li>
                                    );
                                })}
                            </ul>{' '}
                            <div className={styles['recipe-card-bottom']}> </div>
                        </li>
                    </div>
                );
            })}
        </div>
    );
};

export default RecipeCard;
