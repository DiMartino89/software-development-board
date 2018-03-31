import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import 'normalize.css';
import configureStore from './redux';
import Header from './components/header/header';
import Routes from './routes/';

// Import stylesheets
import './assets/stylesheets/base.scss';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-select/dist/react-select.css';

// Import scripts
import '../node_modules/bootstrap/dist/js/bootstrap.js';

const store = configureStore();

ReactDOM.render((
    <Provider store={store}>
        <BrowserRouter>
            <div className="app-container">
                <Header/>
                <main>
                    <Routes/>
                </main>
            </div>
        </BrowserRouter>
    </Provider>
), document.getElementById('root'));

// Enable hot relading
module.hot.accept();
