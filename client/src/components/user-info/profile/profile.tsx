import { userInfo } from 'os';
import React, { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Recipe } from '../../types';
import { RecipeCard } from '../../recipe-card/recipe-card';

export const Profile = () => {
    const [user_id, setUserID] = useState(0);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [recipesPerPage, setRecipesPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);

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
            const response = await axios.get(
                `http://localhost:4000/${user_id}/getsharedrecipes?page=${page}&limit=${limit}`
            );
            const { recipes, totalCount } = response.data;
            setRecipes(recipes);
            // setAllRecipes(recipes);
            setTotalCount(totalCount);
            console.log(response.data, 'recipes in home page with images');
        } catch (error) {
            console.log('Failed to fetch recipes');
            console.log(error);
        }
    };

    const onRecipeDelete = () => {
        try {
            if (currentPage > Math.ceil(totalCount / recipesPerPage)) {
                setCurrentPage(currentPage - 1);
            }

            fetchRecipes(currentPage, recipesPerPage);
        } catch (error) {
            console.log('Failed to fetch recipes');
            console.log(error);
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
        setCurrentPage(Math.min(Math.max(page, 1), totalPages));
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

    return (
        <div>
            <h1>Profile</h1>
            <div className="recipe-list">
                {recipes.map((recipe) => (
                    <RecipeCard
                        key={recipe.recipe_id}
                        recipe={recipe}
                        deleteRecipe={deleteRecipe}
                    />
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
