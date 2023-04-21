import classNames from 'classnames';
import styles from './nav.module.scss';
import { Link } from 'react-router-dom';

export interface NavProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-navs-and-templates
 */
export const Nav = ({ className }: NavProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            <nav>
                <Link to="/">My Recipes</Link> | <Link to="/new-recipe">New Recipe</Link> |{' '}
                <Link to="/profile">Profile</Link>
            </nav>
        </div>
    );
};
