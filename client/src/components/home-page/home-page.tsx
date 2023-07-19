import classNames from 'classnames';
import styles from './home-page.module.scss';
import { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import ManyRecipeCards from '../recipe-card/many-recipe-cards';
import { Recipe, RecipeItem } from '../types';
import React from 'react';

export interface HomePageProps {
    className?: string;
}

export const HomePage = ({ className }: HomePageProps) => {
    const ellipsis = '...';
    const [user_id, setUserID] = useState(0);
    const [user_name, setUserName] = useState('');
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
                setUserName(axiosResponse.data.user_name);
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
            console.log(
                totalCount,
                'total count',
                currentPage,
                'current page',
                recipesPerPage,
                'recipes per page'
            );
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

    const goToPageHandler = (page: number | string) => {
        if (page === ellipsis) return; // Do nothing when the ellipsis is clicked
        goToPage(page as number);
    };

    const renderPagination = () => {
        const firstPage = 1;
        const lastPage = totalPages;

        const middleLower = Math.floor((currentPage + firstPage) / 2);
        const middleHigher = Math.floor((currentPage + lastPage) / 2);

        const paginationButtons = [
            ...(middleLower !== firstPage && middleLower !== currentPage ? [firstPage] : []),
            ...(middleLower > firstPage + 1 ? ellipsis : []),
            ...(middleLower !== currentPage ? [middleLower] : []),
            ...(middleLower < currentPage - 1 ? ellipsis : []),
            currentPage,
            ...(middleHigher > currentPage + 1 ? ellipsis : []),
            ...(middleHigher !== currentPage ? [middleHigher] : []),
            ...(middleHigher < lastPage - 1 ? ellipsis : []),
            ...(middleHigher !== lastPage ? [lastPage] : []),
        ];

        return (
            <div className={styles['pagination-container']}>
                <button
                    onClick={goToPreviousPage}
                    className={styles['pagination-button']}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                {paginationButtons.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '.' ? (
                            <span className={styles['pagination-ellipsis']}>{page}</span>
                        ) : (
                            <button
                                onClick={() => goToPageHandler(page)}
                                className={classNames(styles['pagination-button'], {
                                    [styles['pagination-button-active']]: page === currentPage,
                                })}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
                <button
                    onClick={goToNextPage}
                    className={styles['pagination-button']}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className={classNames(styles.root, className)}>
            <h1 className={styles['home-page-header']}>Welcome, {user_name}!</h1>
            <div>
                <ManyRecipeCards
                    recipes={recipes}
                    onRecipeDelete={onRecipeDelete}
                    user_id={user_id}
                />
            </div>
            {renderPagination()}
        </div>
    );
};

{
    /* <div className={styles['pagination-container']}>
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
        </div> */
}

export default HomePage;
