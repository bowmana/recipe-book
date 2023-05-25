import classNames from 'classnames';
import styles from './home-page.module.scss';
import { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import RecipeCard from './recipe-card/recipe-card';

export interface HomePageProps {
    className?: string;
}

interface RecipeItem {
    recipe_item: string;
    recipe_item_id: number;
}

interface Recipe {
    recipe_items: RecipeItem[];
    recipe_id: number;
    recipe_name: string;
    recipe_cuisine: string;
    recipe_type: string;
}

export const HomePage = ({ className }: HomePageProps) => {
    const [user_id, setUserID] = useState(0);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        const auth = async () => {
            const url =
                process.env.NODE_ENV === 'production'
                    ? 'http://localhost:4001/auth' // Change if actually deployed to real web server
                    : 'http://localhost:4001/auth';

            try {
                const axiosResponse = await axios.post(url, {}, { withCredentials: true });
                setUserID(axiosResponse.data.user_id);
            } catch (axiosError) {
                window.location.href = '/login';
            }
        };

        auth();
    }, [user_id]);
    useEffect(() => {
        if (user_id !== 0) {
            fetchRecipes();
        }
    }, [user_id]);

    const fetchRecipes = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/${user_id}/getrecipes`);
            setRecipes(response.data);
            console.log(response.data);
        } catch (error) {
            console.log('Failed to fetch recipes');
            console.log(error);
        }
    };

    const onRecipeDelete = () => {
        try {
            fetchRecipes();
        } catch (error) {
            console.log('Failed to fetch recipes');
            console.log(error);
        }
    };
    return (
        <div className={classNames(styles.root, className)}>
            <div>
                <RecipeCard recipes={recipes} onRecipeDelete={onRecipeDelete} />
            </div>
        </div>
    );
};

export default HomePage;
