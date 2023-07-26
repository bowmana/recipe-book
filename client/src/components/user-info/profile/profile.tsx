import React, { useRef, useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Recipe, Option } from '../../types';
import { RecipeCard } from '../../recipe-card/recipe-card';
import { Dropdown } from '../../util-components/dropdown';
import classNames from 'classnames';
import styles from './profile.module.scss';
import { ProfileImageUpload } from './profileimage';
interface ProfileProps {
    className?: string;
}

export const Profile = ({ className }: ProfileProps) => {
    const [user_id, setUserID] = useState(0);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [totalCount, setTotalCount] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [lastItemId, setLastItemId] = useState(Number.MAX_SAFE_INTEGER);
    const [searchRecipeName, setSearchRecipeName] = useState('');
    const [recipeCuisine, setRecipeCuisine] = useState<Option | null>(null);
    const [recipeType, setRecipeType] = useState<Option | null>(null);
    const [shouldFetchRecipes, setShouldFetchRecipes] = useState(false);
    const dropDownRef = useRef<any>(null);
    const dropDownRef2 = useRef<any>(null);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [user_name, setUsername] = useState(''); // Add the initial username value here
    const [email, setEmail] = useState(''); // Add the initial email value here
    const [tempUserName, setTempUserName] = useState(''); // Add the initial username value here
    const [tempEmail, setTempEmail] = useState(''); // Add the initial email value here

    useEffect(() => {
        const auth = async () => {
            const url =
                process.env.NODE_ENV === 'production'
                    ? 'http://localhost:4001/auth' // Change if actually deployed to real web server
                    : 'http://localhost:4001/auth';

            try {
                const axiosResponse = await axios.post(url, {}, { withCredentials: true });
                setUserID(axiosResponse.data.user_id);
                setEmail(axiosResponse.data.email);
                setUsername(axiosResponse.data.user_name);

                // After successfully getting the user information, fetch the recipes
                await fetchRecipes();
            } catch (axiosError) {
                window.location.href = '/login';
            }
        };

        auth();
    }, [user_id]);

    const fetchRecipes = async () => {
        try {
            const url =
                process.env.NODE_ENV === 'production'
                    ? `http://localhost:4000/${user_id}/getsharedrecipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}`
                    : `http://localhost:4000/${user_id}/getsharedrecipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}`;

            const axiosResponse = await axios.get(url, { withCredentials: true });

            const { recipes: fetchedRecipes, totalCount: fetchedTotalCount } = axiosResponse.data;
            setRecipes((prevRecipes) => [...prevRecipes, ...fetchedRecipes]);
            console.log(fetchedRecipes, 'fetched recipes');
            setTotalCount(fetchedTotalCount);
            if (fetchedRecipes.length > 0) {
                setLastItemId(fetchedRecipes[fetchedRecipes.length - 1].recipe_id);
            }
        } catch (axiosError) {
            console.log('Failed to fetch recipes');
            console.log(axiosError);
        }
    };

    const fetchRecipesOnClick = async () => {
        setRecipes([]);
        setShouldFetchRecipes(true);
        setLastItemId(Number.MAX_SAFE_INTEGER);

        try {
            const url =
                process.env.NODE_ENV === 'production'
                    ? `http://localhost:4000/${user_id}/getsharedrecipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}`
                    : `http://localhost:4000/${user_id}/getsharedrecipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}`;
            const axiosResponse = await axios.get(url, { withCredentials: true });
            const { recipes: fetchedRecipes, totalCount: fetchedTotalCount } = axiosResponse.data;
            console.log(fetchedRecipes, 'fetched recipes');
            setRecipes((prevRecipes) => [...prevRecipes, ...fetchedRecipes]);
            setTotalCount(fetchedTotalCount);
            if (fetchedRecipes.length > 0) {
                setLastItemId(fetchedRecipes[fetchedRecipes.length - 1].recipe_id);
            }
        } catch (axiosError) {
            console.log('Failed to fetch recipes');
            console.log(axiosError);
        }
    };

    const onRecipeDelete = () => {
        setRecipes([]);
        setLastItemId(Number.MAX_SAFE_INTEGER);
        fetchRecipes();
    };

    // Add horizontal scroll listener to the recipe-card-container's scrollable parent element

    const recipeCardContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (recipeCardContainerRef.current && !isFetching) {
                const container = recipeCardContainerRef.current;
                const containerHeight = container.clientHeight;
                const scrollTop = container.scrollTop;
                const scrollHeight = container.scrollHeight;
                const verticalPercentageToAdd = 0.85;

                // Step 3: Detect vertical scroll to the bottom
                if (
                    scrollTop + containerHeight >=
                    scrollHeight - containerHeight * verticalPercentageToAdd
                ) {
                    console.log('Reached bottom of vertical scroll');
                    setIsFetching(true);
                }
            }
        };

        if (recipeCardContainerRef.current) {
            recipeCardContainerRef.current.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (recipeCardContainerRef.current) {
                recipeCardContainerRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isFetching]);

    useEffect(() => {
        if (isFetching) {
            fetchRecipes()
                .catch((error) => {
                    // Handle fetch error if needed
                })
                .finally(() => {
                    setIsFetching(false);
                });
        }
    }, [isFetching, lastItemId]);

    useEffect(() => {
        if (shouldFetchRecipes) {
            fetchRecipesOnClick();
            setShouldFetchRecipes(false);
        }
    }, [shouldFetchRecipes]);

    const clearSearch = async () => {
        setSearchRecipeName('');
        dropDownRef.current?.clear();
        dropDownRef2.current?.clear();
        setRecipeCuisine(null);
        setRecipeType(null);
        setRecipes([]);
        setShouldFetchRecipes(true);
        setLastItemId(Number.MAX_SAFE_INTEGER);

        try {
            const url =
                process.env.NODE_ENV === 'production'
                    ? `http://localhost:4000/${user_id}/getsharedrecipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}`
                    : `http://localhost:4000/${user_id}/getsharedrecipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}`;
            const axiosResponse = await axios.get(url, { withCredentials: true });
            const { recipes: fetchedRecipes, totalCount: fetchedTotalCount } = axiosResponse.data;
            console.log(fetchedRecipes, 'fetched recipes');
            setRecipes((prevRecipes) => [...prevRecipes, ...fetchedRecipes]);
            setTotalCount(fetchedTotalCount);
            if (fetchedRecipes.length > 0) {
                setLastItemId(fetchedRecipes[fetchedRecipes.length - 1].recipe_id);
            }
        } catch (axiosError) {
            console.log('Failed to fetch recipes');
            console.log(axiosError);
        }
    };

    const deleteRecipe = async (recipe_id: number) => {
        try {
            await axios.delete(`http://localhost:4000/${user_id}/deletesharedrecipe/${recipe_id}`);
            onRecipeDelete();
        } catch (error) {
            console.log('Failed to delete recipe');
            console.log(error);
        }
    };
    const addRecipeCuisine = (recipe_cuisine: Option | null) => {
        setRecipeCuisine(recipe_cuisine);
    };

    const addRecipeType = (recipe_type: Option | null) => {
        setRecipeType(recipe_type);
    };

    const handleSaveUsername = async () => {
        try {
            await axios.post('http://localhost:4005/events', {
                type: 'UsernameUpdated',
                data: {
                    user_id: user_id,
                    user_name: tempUserName,
                },
            });

            // After successfully updating, set the isEditingUsername state back to false
            setIsEditingUsername(false);
            setUsername(tempUserName);
        } catch (error) {
            console.log('Failed to save username');
            console.log(error);
        }
    };

    const handleSaveEmail = async () => {
        try {
            await axios.post('http://localhost:4005/events', {
                type: 'EmailUpdated',
                data: {
                    user_id: user_id,
                    email: tempEmail.toLowerCase(),
                },
            });
            // After successfully updating, set the isEditingEmail state back to false
            setIsEditingEmail(false);
            setEmail(tempEmail);
        } catch (error) {
            console.log('Failed to save email');
            console.log(error);
        }
    };

    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles['profile-container']}>
                <div className={styles['profile-image-container']}>
                    <ProfileImageUpload
                        className="profileTheme"
                        initialImage="https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
                        user_id={user_id}
                    />
                </div>
                <div className={styles['profile-info-container']}>
                    <div className={styles['profile-info']}>
                        <h1>
                            {isEditingUsername ? (
                                <input
                                    type="text"
                                    value={tempUserName}
                                    onChange={(e) => setTempUserName(e.target.value)}
                                />
                            ) : (
                                `Username: ${user_name}`
                            )}
                        </h1>
                        {isEditingUsername ? (
                            <>
                                <button onClick={handleSaveUsername}>Save</button>
                                <button
                                    onClick={() => {
                                        setIsEditingUsername(false);
                                        setTempUserName(user_name);
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditingUsername(true)}>
                                Edit Username
                            </button>
                        )}

                        <h2>
                            {isEditingEmail ? (
                                <input
                                    type="email"
                                    value={tempEmail}
                                    onChange={(e) => setTempEmail(e.target.value)}
                                />
                            ) : (
                                `Email: ${email}`
                            )}
                        </h2>
                        {isEditingEmail ? (
                            <>
                                <button onClick={handleSaveEmail}>Save</button>
                                <button
                                    onClick={() => {
                                        setIsEditingEmail(false);
                                        setTempEmail(email);
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditingEmail(true)}>Edit Email</button>
                        )}

                        <h2>Recipes Shared: {totalCount}</h2>
                    </div>
                </div>
            </div>

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
                        <button onClick={fetchRecipesOnClick}>Search</button>
                        <button onClick={clearSearch}>Clear</button>
                    </div>
                </div>
            </div>

            {/* --------------------------------------------------------------------------------------------------------------------------------------------------- */}

            <div className={styles['recipe-card-container']} ref={recipeCardContainerRef}>
                {recipes.map((recipe) => (
                    <RecipeCard
                        key={recipe.recipe_id}
                        recipe={recipe}
                        deleteRecipe={deleteRecipe}
                        currentUserId={user_id}
                        className="profileTheme"
                    />
                ))}
            </div>
            {isFetching && <p>Loading more recipes...</p>}
        </div>
    );
};
