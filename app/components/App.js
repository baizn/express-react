import React, {Component} from 'react';
import {RouteHandler} from 'react-router';

import Footer from './Footer';
import Navbar from './Navbar';

class App extends Component {
    render() {
        return (
            <div>
                <Navbar />
                <RouteHandler />
                <Footer />
            </div>
        );
    }
}

export default App;
