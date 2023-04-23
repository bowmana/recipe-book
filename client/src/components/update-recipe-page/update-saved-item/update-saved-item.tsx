import classNames from 'classnames';
import styles from './update-saved-item.module.scss';

export interface SavedItemProps {
    className?: string;
}
interface RecipeItem {
    id: string;
    recipe_item: string;
    isEditing: boolean;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-items-and-templates
 */
export const UpdateSavedItem = ({ className, recipe_item }: SavedItemProps & any) => {
    return (
        <div className={classNames(styles.root, className)}>
            <ul>
                <li className={styles['recipe-item']}>
                    <h3>{recipe_item.recipe_item}</h3>
                </li>
            </ul>
        </div>
    );
};
