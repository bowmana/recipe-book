import React from 'react';
import { Link } from 'react-router-dom';
import { ImageCycle } from '../../util-components/imagecycle';
import styles from './recipe-card.module.scss';
import { Recipe, RecipeItem } from '../../types';

interface RecipeCardItemProps {
    recipe: Recipe;
    deleteRecipe: (recipe_id: number) => void;
}

export const RecipeCard = ({ recipe, deleteRecipe }: RecipeCardItemProps) => {
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
                                <h3 className={styles['recipe-card-item']}>{item.recipe_item}</h3>
                                <h3 className={styles['recipe-card-portion']}>
                                    {item.portion_size}
                                </h3>
                            </li>
                        );
                    })}
                </ul>
                <div className={styles['recipe-card-line-separator']}> </div>
                <div className={styles['recipe-card-description']}>
                    <h3>{recipe.recipe_description}</h3>
                </div>
                <div className={styles['recipe-card-bottom']}> </div>
            </li>
        </div>
    );
};
