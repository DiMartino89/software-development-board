import React, {PropTypes} from 'react';
import Container from './single-project/Container.jsx'

const Projectboard = () => (

    <Container/>
);

Projectboard.propTypes = {
    secretData: PropTypes.string.isRequired
};

export default Projectboard;
