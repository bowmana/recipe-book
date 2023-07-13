import classNames from 'classnames';
import styles from './home-page.module.scss';
import { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import ManyRecipeCards from '../recipe-card/many-recipe-cards';
import { Recipe, RecipeItem } from '../types';

export interface HomePageProps {
    className?: string;
}

export const HomePage = ({ className }: HomePageProps) => {
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
                `http://localhost:4000/${user_id}/getrecipes?page=${page}&limit=${limit}`
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

    return (
        <div className={classNames(styles.root, className)}>
            <div>
                <ManyRecipeCards
                    recipes={recipes}
                    onRecipeDelete={onRecipeDelete}
                    user_id={user_id}
                />
            </div>
            <div className={styles['pagination-container']}>
                <button
                    onClick={goToPreviousPage}
                    className={styles['pagination-button']}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => goToPage(index + 1)}
                        className={classNames(styles['pagination-button'], {
                            [styles['pagination-button-active']]: index + 1 === currentPage,
                        })}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={goToNextPage}
                    className={styles['pagination-button']}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default HomePage;
