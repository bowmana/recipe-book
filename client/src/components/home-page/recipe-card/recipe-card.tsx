import React from 'react';
import classNames from 'classnames';
import styles from './recipe-card.module.scss';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
export interface RecipeCardProps {
    className?: string;
    onRecipeDelete: () => void;
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
}

interface RecipeCardPropsWithRecipes extends RecipeCardProps {
    recipes: Recipe[];
}

const RecipeCard = ({ className, recipes, onRecipeDelete }: RecipeCardPropsWithRecipes) => {
    const deleteRecipe = async (recipe_id: number) => {
        await axios
            .delete(`http://localhost:4000/recipes/delete/${recipe_id}`)
            .then((response) => {
                onRecipeDelete();
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div className={classNames(styles.root, className)}>
            <h1>Recipes</h1>
            <ul>
                {recipes.map((recipe) => {
                    return (
                        <div className={styles['recipe-card']}>
                            <li key={recipe.recipe_id}>
                                <div className={styles['recipe-card-buttons']}>
                                    <h2>{recipe.recipe_name}</h2>
                                    <h3>{recipe.recipe_cuisine}</h3>
                                    <h3>{recipe.recipe_type}</h3>

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

                                <ul>
                                    {recipe.recipe_items.map((item: RecipeItem) => {
                                        return (
                                            <li key={item.recipe_item_id}>
                                                <h3>{item.recipe_item}</h3>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        </div>
                    );
                })}
            </ul>
        </div>
    );
};

export default RecipeCard;
