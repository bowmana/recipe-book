import classNames from 'classnames';
import styles from './user-nav.module.scss';
import { Link } from 'react-router-dom';

export interface UserNavProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-navs-and-templates
 */
export const UserNav = ({ className }: UserNavProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            <nav>
                <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
            </nav>
        </div>
    );
};
