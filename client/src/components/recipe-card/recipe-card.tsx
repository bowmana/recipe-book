import React from 'react';
import { Link } from 'react-router-dom';
import { ImageCycle } from '../util-components/imagecycle';
import styles from './recipe-card.module.scss';
import { Recipe, RecipeItem } from '../types';
import classNames from 'classnames';

interface RecipeCardItemProps {
    recipe: Recipe;
    deleteRecipe?: (recipe_id: number) => void;
    addRecipe?: (recipe: Recipe) => void;
    currentUserId: number;
    className?: string;
}

export const RecipeCard = ({
    recipe,
    deleteRecipe,
    addRecipe,
    currentUserId,
    className,
}: RecipeCardItemProps) => {
    const isSocialCard = className === 'socialTheme';
    const isCurrentUser = recipe.u_id !== currentUserId;
    const hasOriginalUser = recipe.original_u_id !== null && recipe.original_u_id !== recipe.u_id;
    const rootClassName = classNames(styles.root, className, {
        [styles.socialTheme]: className === 'socialTheme',
        [styles.profileTheme]: className === 'profileTheme',
    });
    return (
        <div className={rootClassName}>
            <div className={styles['recipe-card']}>
                <li className={styles['recipe-card-li']} key={recipe.recipe_id}>
                    <div className={styles['recipe-card-header']}>
                        <h2>{recipe.recipe_name}</h2>
                        <h3>Cuisine: {recipe.recipe_cuisine}</h3>
                        <h3>Meal Category: {recipe.recipe_type}</h3>
                        <div className={styles['recipe-card-share']}>
                            {isSocialCard && ( // Conditionally render the user profile image
                                <>
                                    <h3>
                                        user: {recipe.u_name} id: {recipe.u_id}
                                    </h3>
                                    <img
                                        src={recipe.u_profile_image}
                                        height="50"
                                        width="50"
                                        alt="profile"
                                    />
                                </>
                            )}

                            {hasOriginalUser && (
                                <>
                                    <h3>
                                        Original Author: {recipe.original_u_name} id:{' '}
                                        {recipe.original_u_id}
                                    </h3>

                                    {isSocialCard && ( // Conditionally render the original user profile image
                                        <img
                                            src={recipe.original_u_profile_image}
                                            height={50}
                                            width={50}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className={styles['recipe-card-line-separator']}> </div>
                    <div className={styles['recipe-card-content']}>
                        <div className={styles['recipe-card-buttons']}>
                            {!addRecipe && (
                                <Link
                                    to={`/update-recipe/${recipe.recipe_id}`}
                                    className={styles['edit-recipe']}
                                >
                                    {' '}
                                    edit{' '}
                                </Link>
                            )}
                            {deleteRecipe ? (
                                <button
                                    className={styles['delete-recipe']}
                                    onClick={() => {
                                        deleteRecipe(recipe.recipe_id);
                                    }}
                                >
                                    {' '}
                                    delete{' '}
                                </button>
                            ) : (
                                isCurrentUser &&
                                addRecipe && (
                                    <button
                                        className={styles['delete-recipe']}
                                        onClick={() => {
                                            addRecipe(recipe);
                                        }}
                                    >
                                        {' '}
                                        add{' '}
                                    </button>
                                )
                            )}
                        </div>
                        <ImageCycle imageUrls={recipe.recipe_images} className={className} />
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
                    </ul>
                    <div className={styles['recipe-card-line-separator']}> </div>
                    <div className={styles['recipe-card-description']}>
                        <h3>{recipe.recipe_description}</h3>
                    </div>
                    <div className={styles['recipe-card-bottom']}> </div>
                </li>
            </div>
        </div>
    );
};
