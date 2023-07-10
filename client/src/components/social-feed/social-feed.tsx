import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Recipe } from '../types';
import { RecipeCard } from '../recipe-card/recipe-card';

export const SocialFeed = () => {
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

    return (
        <div className="social-feed">
            <h1>Recipes from other users</h1>
            <div className="social-feed__recipes">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.recipe_id} recipe={recipe} />
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
