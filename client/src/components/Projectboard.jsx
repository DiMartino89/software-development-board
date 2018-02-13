import React, {PropTypes} from 'react';
import Container from './drag-and-drop/Container.jsx'

const Projectboard = () => (

    <Container/>
);

Projectboard.propTypes = {
    secretData: PropTypes.string.isRequired
};

export default Projectboard;
