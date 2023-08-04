import React from 'react';
import { Link } from 'react-router-dom';
import { ImageCycle } from '../util-components/imagecycle';
import styles from './recipe-card.module.scss';
import { Instruction, Recipe, RecipeItem } from '../types';
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
    console.log(recipe, 'recipe in recipe card');
    return (
        <div className={rootClassName}>
            <div className={styles['recipe-card']}>
                <li className={styles['recipe-card-li']} key={recipe.recipe_id}>
                    <div className={styles['recipe-card-header']}>
                        <div className={styles['recipe-card-header-info-container']}>
                            <h2 className={styles['name']}>{recipe.recipe_name}</h2>
                            <div className={styles['recipe-card-header-wrapper']}>
                                <div className={styles['recipe-card-header-info']}>
                                    <div className={styles['cuisine']}>
                                        {recipe.recipe_cuisine && (
                                            <h3>
                                                <span className="optional-text-large">
                                                    Cuisine:
                                                </span>{' '}
                                                {recipe.recipe_cuisine}
                                            </h3>
                                        )}
                                    </div>
                                    <div className={styles['type']}>
                                        {recipe.recipe_type && (
                                            <h3>
                                                <span className="optional-text-large">
                                                    Meal Category:
                                                </span>{' '}
                                                {recipe.recipe_type}
                                            </h3>
                                        )}
                                    </div>
                                </div>

                                <div className={styles['recipe-card-user-container']}>
                                    <div className={styles['recipe-card-user']}>
                                        {isSocialCard && (
                                            <>
                                                <h3>user: {recipe.u_name}</h3>
                                                {recipe.u_profile_image && (
                                                    <img
                                                        className={styles['profile-image']}
                                                        src={recipe.u_profile_image}
                                                        alt="profile"
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className={styles['recipe-card-original-user']}>
                                        {hasOriginalUser && (
                                            <>
                                                <h3>Original Author: {recipe.original_u_name}</h3>

                                                {isSocialCard &&
                                                    recipe.original_u_profile_image && (
                                                        <img
                                                            src={recipe.original_u_profile_image}
                                                            alt="profile"
                                                            className={styles['profile-image']}
                                                        />
                                                    )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
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
                    {recipe.recipe_description && (
                        <div className={styles['recipe-card-description']}>
                            <h3>{recipe.recipe_description}</h3>
                        </div>
                    )}
                    <div className={styles['recipe-card-line-separator']}> </div>
                    <ul className={styles['recipe-card-ingredients']}>
                        {recipe.recipe_items.map((item: RecipeItem) => {
                            return (
                                <li key={item.recipe_item_id}>
                                    <div className={styles['recipe-card-item-container']}>
                                        <h3 className={styles['recipe-card-item']}>
                                            {item.recipe_item}
                                        </h3>
                                        <h3 className={styles['recipe-card-portion']}>
                                            {item.portion_size}
                                        </h3>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <div className={styles['recipe-card-line-separator']}> </div>
                    <div className={styles['recipe-card-instructions-wrapper']}>
                        <ul className={styles['recipe-card-instructions-list']}>
                            {recipe.recipe_instructions.map((item: Instruction) => {
                                return (
                                    <li key={item.instruction_id}>
                                        <h3 className={styles['recipe-card-instruction']}>
                                            {item.instruction_order}) {item.instruction}
                                        </h3>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className={styles['recipe-card-bottom']}> </div>
                </li>
            </div>
        </div>
    );
};
