import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Recipe } from '../types';
import { RecipeCard } from '../recipe-card/recipe-card';
import path from 'path';

export const SocialFeed = () => {
    const [user_id, setUserID] = useState(0);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [recipesPerPage, setRecipesPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    useEffect(() => {
        const auth = async () => {
            const url =
                process.env.NODE_ENV === 'production'
                    ? 'http://localhost:4001/auth' // Change if actually deployed to real web server
                    : 'http://localhost:4001/auth';

            try {
                const axiosResponse = await axios.post(url, {}, { withCredentials: true });
                setUserID(axiosResponse.data.user_id);
                fetchRecipes(currentPage, recipesPerPage);
            } catch (axiosError) {
                window.location.href = '/login';
            }
        };

        auth();
    }, [currentPage, recipesPerPage, user_id]);
    useEffect(() => {
        if (user_id !== 0) {
            fetchRecipes(currentPage, recipesPerPage);
        }
    }, [currentPage, recipesPerPage, user_id]);

    const fetchRecipes = async (page: number, limit: number) => {
        try {
            const url =
                process.env.NODE_ENV === 'production'
                    ? `http://localhost:4000/social-recipes?page=${page}&limit=${limit}`
                    : `http://localhost:4000/social-recipes?page=${page}&limit=${limit}`;

            const axiosResponse = await axios.get(url, { withCredentials: true });

            const { recipes, totalCount } = axiosResponse.data;

            setRecipes(recipes);
            console.log(axiosResponse, 'recipes in social feed');
            setTotalCount(totalCount);
        } catch (axiosError) {
            console.log('Failed to fetch recipes');
            console.log(axiosError);
        }
    };

    const totalPages = Math.ceil(totalCount / recipesPerPage);

    const goToNextPage = () => {
        const nextPage = currentPage + 1;
        if (nextPage <= totalPages) {
            setCurrentPage(nextPage);
            fetchRecipes(nextPage, recipesPerPage);
        }
    };

    const goToPreviousPage = () => {
        const previousPage = currentPage - 1;
        if (previousPage >= 1) {
            setCurrentPage(previousPage);
            fetchRecipes(previousPage, recipesPerPage);
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
        fetchRecipes(page, recipesPerPage);
    };

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

    const addRecipe = async (recipe: Recipe) => {
        const {
            recipe_name,
            recipe_cuisine,
            recipe_type,
            recipe_description,
            recipe_items,
            recipe_images,
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
        <div className="social-feed">
            <h1>Recipes from other users</h1>
            <div className="social-feed__recipes">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.recipe_id} recipe={recipe} addRecipe={addRecipe} />
                ))}
            </div>
            <div className="pagination">
                <button onClick={goToPreviousPage} disabled={currentPage === 1}>
                    Previous
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToPage(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
                <button onClick={goToNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};
