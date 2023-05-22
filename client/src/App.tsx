import { useState } from 'react';
import classNames from 'classnames';
import { ReactComponent as ReactLogo } from './assets/react.svg';
import { ReactComponent as ViteLogo } from './assets/vite.svg';
import { ReactComponent as TypescriptLogo } from './assets/typescript.svg';
import { ReactComponent as ScssLogo } from './assets/scss.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Nav } from './components/nav/nav';

import { HomePage } from './components/home-page/home-page';
import { ItemWrapper } from './components/new-recipe-page/item-wrapper/item-wrapper';
import { UpdateItemWrapper } from './components/update-recipe-page/update-item-wrapper/update-item-wrapper';
import { Registerform } from './components/user-info/register-form/register-form';
import { Loginform } from './components/user-info/login-form/login-form';
import { Logoutform } from './components/user-info/logout-form/logout-form';
import { UserNav } from './components/user-info/user-nav/user-nav';
import styles from './App.module.scss';

function App() {
    const [count, setCount] = useState(0);

    return (
        <Router>
            <div className={styles.App}>
                <Routes>
                    <Route
                        path="/home"
                        element={
                            <div>
                                <Nav /> <HomePage />{' '}
                            </div>
                        }
                    />
                    <Route
                        path="/new-recipe"
                        element={
                            <div>
                                <Nav />
                                <ItemWrapper />
                            </div>
                        }
                    />
                    <Route
                        path="/update-recipe/:recipe_id"
                        element={
                            <div>
                                <Nav />
                                <UpdateItemWrapper />
                            </div>
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <div>
                                <UserNav />
                                <Loginform />
                            </div>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <div>
                                <UserNav />
                                <Registerform />
                            </div>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <div>
                                <UserNav />
                                <Logoutform />
                            </div>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
