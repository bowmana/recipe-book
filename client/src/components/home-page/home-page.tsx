import classNames from 'classnames';
import styles from './home-page.module.scss';
import { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import RecipeCard from './recipe-card/recipe-card';

export interface HomePageProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-home-pages-and-templates
 */
export const HomePage = ({ className }: HomePageProps) => {
    const [recipes, setRecipes] = useState<any[]>([]); //please fix this TYPE!!!!!!!!!!!!!!

    const fetchRecipes = async () => {
        try {
            const response: AxiosResponse = await axios.get('http://localhost:4002/recipes');
            const data = response.data;
            const recipeKeys = Object.keys(data);
            const recipes = recipeKeys.map((key) => {
                return data[key];
            });
            setRecipes(recipes);
            console.log(recipes);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    return (
        <div className={classNames(styles.root, className)}>
            <div>
                <RecipeCard recipes={recipes} />
            </div>
        </div>
    );
};

export default HomePage;
