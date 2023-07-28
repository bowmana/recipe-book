import React, { useRef, useState } from 'react';
import { Dropdown } from '../util-components/dropdown';
import { Option } from '../types';
import classNames from 'classnames';
import styles from './search-bar.module.scss';
export interface SearchProps {
    className?: string;
    addRecipeCuisine: (recipe_cuisine: Option | null) => void;
    addRecipeType: (recipe_type: Option | null) => void;
    fetchRecipesOnClick: () => void;
    clearSearch: () => void;
    dropDownRef?: any;
    dropDownRef2?: any;
    searchRecipeName: string;
    setSearchRecipeName: (searchRecipeName: string) => void;
}

export const SearchBar = ({
    className,
    addRecipeCuisine,
    addRecipeType,
    fetchRecipesOnClick,
    clearSearch,
    dropDownRef,
    dropDownRef2,
    searchRecipeName,
    setSearchRecipeName,
}: SearchProps) => {
    const rootClassName = classNames(styles.root, className, {
        [styles.socialTheme]: className === 'socialTheme',
        [styles.profileTheme]: className === 'profileTheme',
    });
    return (
        <div className={rootClassName}>
            <div className={styles['search-wrapper']}>
                <div className={styles['search-container']}>
                    <div className={styles['search-bar']}>
                        <input
                            type="text"
                            placeholder="Search by recipe name"
                            value={searchRecipeName}
                            onChange={(e) => setSearchRecipeName(e.target.value)}
                        />
                    </div>

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
                            place_holder="Search by recipe cuisine"
                        />
                    </div>

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
                            place_holder="Search by recipe type"
                        />
                    </div>
                </div>
                <div className={styles['search-buttons']}>
                    <button onClick={fetchRecipesOnClick}>Search</button>
                    <button onClick={clearSearch}>Clear</button>
                </div>
            </div>
        </div>
    );
};
