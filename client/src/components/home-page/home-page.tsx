import classNames from 'classnames';
import styles from './home-page.module.scss';

export interface HomePageProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-home-pages-and-templates
 */
export const HomePage = ({ className }: HomePageProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            <div>
                <ul></ul>
                HomePage
            </div>
        </div>
    );
};
