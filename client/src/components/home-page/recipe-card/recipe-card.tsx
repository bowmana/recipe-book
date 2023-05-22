import React from 'react';
import classNames from 'classnames';
import styles from './recipe-card.module.scss';
import { Link } from 'react-router-dom';
import axios from 'axios';

export interface RecipeCardProps {
    className?: string;
}

interface RecipeItem {
    recipe_item: string;
    recipe_item_id: number;
}

interface Recipe {
    recipe_items: RecipeItem[];
    recipe_id: number;
    recipe_name: string;
}

interface RecipeList {
    recipes: Recipe[];
}

const RecipeCard = ({ className, recipes }: RecipeCardProps & RecipeList) => {
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

                                    <Link
                                        to={`/update-recipe/${recipe.recipe_id}`}
                                        className={styles['edit-recipe']}
                                    >
                                        {' '}
                                        edit{' '}
                                    </Link>

                                    <button>delete</button>
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
