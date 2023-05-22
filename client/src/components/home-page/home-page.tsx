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

interface RecipeItem {
    recipe_item: string;
    recipe_item_id: number;
}

interface Recipe {
    recipe_items: RecipeItem[];
    recipe_id: number;
    recipe_name: string;
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
                const fetchRecipes = async () => {
                    try {
                        const response = await axios.get(
                            `http://localhost:4000/${user_id}/getrecipes`
                        );
                        setRecipes(response.data);
                        console.log(response.data);
                    } catch (error) {
                        console.log('Failed to fetch recipes');
                        console.log(error);
                    }
                };
                fetchRecipes();
            } catch (axiosError) {
                window.location.href = '/login';
            }
        };

        auth();
    }, [user_id]);

    return (
        <div className={classNames(styles.root, className)}>
            <div>
                <RecipeCard recipes={recipes} />{' '}
            </div>
        </div>
    );
};

//             const recipeKeys = Object.keys(data);
//             const recipes = recipeKeys.map((key) => {
//                 return data[key];
//             });
//             setRecipes(recipes);
//             console.log(recipes);
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         fetchRecipes();
//     }, []);

//     return (
//         <div className={classNames(styles.root, className)}>
//             <div>
//                 <RecipeCard recipes={recipes} />
//             </div>
//         </div>
//     );
// };

export default HomePage;
