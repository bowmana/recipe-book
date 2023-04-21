import { useState } from 'react';
import classNames from 'classnames';
import { ReactComponent as ReactLogo } from './assets/react.svg';
import { ReactComponent as ViteLogo } from './assets/vite.svg';
import { ReactComponent as TypescriptLogo } from './assets/typescript.svg';
import { ReactComponent as ScssLogo } from './assets/scss.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Nav } from './components/nav/nav';

import { HomePage } from './components/home-page/home-page';
import { ItemWrapper } from './components/item-wrapper/item-wrapper';
import styles from './App.module.scss';

function App() {
    const [count, setCount] = useState(0);

    return (
        <Router>
            <div className={styles.App}>
                <Nav />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/new-recipe" element={<ItemWrapper />} />
                    {/* <Route path="/profile" element={<Profile />} /> */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
