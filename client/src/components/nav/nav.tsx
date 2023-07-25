import classNames from 'classnames';
import styles from './nav.module.scss';
import { Link } from 'react-router-dom';
import favicon from '../../assets/SSfavicon.svg';

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
            <nav className={styles['nav']}>
                <img className={styles.favicon} src={favicon} alt="logo" />
                <Link to="/home" className={styles.link}>
                    My Recipes
                </Link>{' '}
                |{' '}
                <Link to="/new-recipe" className={styles.link}>
                    New Recipe
                </Link>{' '}
                |{' '}
                <Link to="/social-feed" className={styles.link}>
                    Social Feed
                </Link>{' '}
                |
                <Link to="/profile" className={styles.link}>
                    Profile
                </Link>
            </nav>
        </div>
    );
};
