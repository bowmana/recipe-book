import classNames from 'classnames';
import styles from './social-feed.module.scss';
import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { Recipe, Option } from '../types';
import { RecipeCard } from '../recipe-card/recipe-card';
import path from 'path';
import { Dropdown } from '../util-components/dropdown';
import { SearchBar } from '../shared-components/search-bar';
export interface SocialPageProps {
    className?: string;
}
export const SocialFeed = ({ className }: SocialPageProps) => {
    const [user_id, setUserID] = useState(0);
    const [user_name, setUserName] = useState('');

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [lastItemId, setLastItemId] = useState(Number.MAX_SAFE_INTEGER);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [searchRecipeName, setSearchRecipeName] = useState('');
    const [shouldFetchRecipes, setShouldFetchRecipes] = useState(false);

    const [recipeCuisine, setRecipeCuisine] = useState<Option | null>(null);
    const [recipeType, setRecipeType] = useState<Option | null>(null);
    const dropDownRef = useRef<any>(null);
    const dropDownRef2 = useRef<any>(null);

    useEffect(
        () => {
            const auth = async () => {
                const url =
                    process.env.NODE_ENV === 'production'
                        ? 'http://localhost:4001/auth' // Change if actually deployed to real web server
                        : 'http://localhost:4001/auth';

                try {
                    const axiosResponse = await axios.post(url, {}, { withCredentials: true });
                    setUserID(axiosResponse.data.user_id);
                    setUserName(axiosResponse.data.user_name);

                    // fetchRecipes(currentPage, recipesPerPage);
                    // fetchRecipes();
                } catch (axiosError) {
                    window.location.href = '/login';
                }
            };

            auth();
        },
        [user_id]

        // [currentPage, recipesPerPage, user_id]
    );
    useEffect(() => {
        if (user_id !== 0) {
            fetchRecipes();
        }
    }, [user_id]);

    const fetchRecipes = async () => {
        try {
            const url =
                process.env.NODE_ENV === 'production'
                    ? `http://localhost:4000/social-recipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}` // Change if actually deployed to real web server
                    : `http://localhost:4000/social-recipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
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

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight =
                document.documentElement.scrollHeight || document.body.scrollHeight;
            const percentageToSubtract = 0.85;

            if (windowHeight + scrollTop >= scrollHeight - windowHeight * percentageToSubtract) {
                setIsFetching(true);
            }
        };

        document.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, []);

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

    async function toFile(url: string): Promise<File> {
        try {
            const response = await fetch(url, { mode: 'no-cors' });
            const blob = await response.blob();
            const file = new File([blob], url, {
                type: blob.type,
                lastModified: Date.now(),
            });
            return file;
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }

    const clearSearch = async () => {
        setSearchRecipeName('');
        dropDownRef.current?.clear();
        dropDownRef2.current?.clear();
        setRecipeCuisine(null);
        setRecipeType(null);
        setRecipes([]);
        setShouldFetchRecipes(true);
        setLastItemId(Number.MAX_SAFE_INTEGER);

        // Fetch new recipes after clearing the search
        try {
            const url =
                process.env.NODE_ENV === 'production'
                    ? `http://localhost:4000/social-recipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}` // Change if actually deployed to real web server
                    : `http://localhost:4000/social-recipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}`;

            const axiosResponse = await axios.get(url, { withCredentials: true });

            const { recipes: fetchedRecipes, totalCount: fetchedTotalCount } = axiosResponse.data;
            console.log(fetchedRecipes, 'fetched recipes');
            setRecipes(fetchedRecipes); // Set the new recipes directly, don't concatenate with previous ones
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

        // Fetch new recipes after clearing the search

        try {
            const url =
                process.env.NODE_ENV === 'production'
                    ? `http://localhost:4000/social-recipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}` // Change if actually deployed to real web server
                    : `http://localhost:4000/social-recipes?lastItemId=${lastItemId}&limit=${5}&recipe_name=${searchRecipeName}&recipe_cuisine=${
                          recipeCuisine ? recipeCuisine.value : ''
                      }&recipe_type=${recipeType ? recipeType.value : ''}`;

            const axiosResponse = await axios.get(url, { withCredentials: true });

            const { recipes: fetchedRecipes, totalCount: fetchedTotalCount } = axiosResponse.data;
            console.log(fetchedRecipes, 'fetched recipes');

            setRecipes(fetchedRecipes); // Set the new recipes directly, don't concatenate with previous ones
            setTotalCount(fetchedTotalCount);
            if (fetchedRecipes.length > 0) {
                setLastItemId(fetchedRecipes[fetchedRecipes.length - 1].recipe_id);
            }
        } catch (axiosError) {
            console.log('Failed to fetch recipes');
            console.log(axiosError);
        }
    };

    const addRecipeCuisine = (recipe_cuisine: Option | null) => {
        setRecipeCuisine(recipe_cuisine);
    };

    const addRecipeType = (recipe_type: Option | null) => {
        setRecipeType(recipe_type);
    };

    const addRecipe = async (recipe: Recipe) => {
        const {
            recipe_name,
            recipe_cuisine,
            recipe_type,
            recipe_description,
            recipe_items,
            recipe_images,
            u_name,
            u_id,
            original_u_id,
            original_u_name,
        } = recipe;
        const formData = new FormData();

        for (const image of recipe_images) {
            console.log(image, 'image in add recipe');
            const file = await toFile(image);
            console.log(file, 'file in add recipe');
            formData.append('recipe_images', file);
        }
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: any) => {
                const { loaded, total } = progressEvent;
                const percent = Math.floor((loaded * 100) / total);
                // setUploadProgress(percent);
            },
        };

        recipe_items.forEach((item, index) => {
            formData.append(`recipe_items[${index}][recipe_item]`, item.recipe_item);
            formData.append(`recipe_items[${index}][portion_size]`, item.portion_size);
        });

        formData.append('recipe_name', recipe_name);
        formData.append('u_name', u_name);
        formData.append('u_id', u_id.toString());
        formData.append('original_u_id', original_u_id.toString());
        formData.append('original_u_name', original_u_name);

        formData.append('recipe_cuisine', recipe_cuisine ? recipe_cuisine : '');
        formData.append('recipe_type', recipe_type ? recipe_type : '');
        formData.append('recipe_description', recipe_description ? recipe_description : '');

        try {
            const response = await axios.post(
                `http://localhost:4000/${user_id}/recipes`,
                formData,
                config
            );
            window.location.href = '/home';
            setIsUploading(false);
            console.log(response);
        } catch (error) {
            console.log(error);
            setIsUploading(false);
        }
    };

    return (
        <div className={classNames(styles.root, className)}>
            <SearchBar
                addRecipeCuisine={addRecipeCuisine}
                addRecipeType={addRecipeType}
                fetchRecipesOnClick={fetchRecipesOnClick}
                clearSearch={clearSearch}
                dropDownRef={dropDownRef}
                dropDownRef2={dropDownRef2}
                searchRecipeName={searchRecipeName}
                setSearchRecipeName={setSearchRecipeName}
            />

            {/* 
-------------------------------------------------------------------------------------------------------------- */}

            <div className={styles['recipe-cards-container']}>
                {recipes.map((recipe) => (
                    <RecipeCard
                        key={recipe.recipe_id}
                        recipe={recipe}
                        addRecipe={addRecipe}
                        currentUserId={user_id}
                        className="socialTheme"
                    />
                ))}
                {isFetching && <p>Loading more recipes...</p>}
            </div>
        </div>
    );
};
