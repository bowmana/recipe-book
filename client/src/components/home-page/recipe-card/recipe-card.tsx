import React from 'react';
import classNames from 'classnames';
import styles from './recipe-card.module.scss';
import { Link } from 'react-router-dom';
import axios from 'axios';

export interface RecipeCardProps {
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

const RecipeCard = ({ className, recipes }: RecipeCardProps & RecipeList) => {
    const editRecipe = async (id: string) => {
        //post id to server

        await axios.post('/edit-recipe', { id });
        console.log('posted', { id }, ' to server');

        //redirect to edit page
    };

    return (
        <div className={classNames(styles.root, className)}>
            <h1>Recipes</h1>
            <ul>
                {recipes.map((recipe) => {
                    return (
                        <div className={styles['recipe-card']}>
                            <li key={recipe.id}>
                                <div className={styles['recipe-card-buttons']}>
                                    <h2>{recipe.recipe_name}</h2>

                                    <Link
                                        to={`/update-recipe/${recipe.id}`}
                                        className={styles['edit-recipe']}
                                        onClick={() => editRecipe(recipe.id)}
                                    >
                                        {' '}
                                        edit{' '}
                                    </Link>

                                    <button>delete</button>
                                </div>

                                <ul>
                                    {recipe.recipe_items.map((item: any) => {
                                        return <li key={item.id}>{item.recipe_item}</li>;
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
