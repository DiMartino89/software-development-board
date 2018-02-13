import React from 'react';
import Projectboard from "../components/Projectboard.jsx";
import Auth from "../modules/Auth";


class ProjectboardPage extends React.Component {

    /**
     * Class constructor.
     */
    constructor(props) {
        super(props);

        this.state = {
            secretData: ''
        };
    }

    /**
     * This method will be executed after initial rendering.
     */
    componentDidMount() {
        const xhr = new XMLHttpRequest();
        xhr.open('get', '/api/projectboard');
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        // set the authorization HTTP header
        xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
        xhr.responseType = 'json';
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                this.setState({
                    secretData: xhr.response.message
                });
            }
        });
        xhr.send();
    }

    /**
     * Render the component.
     */
    render() {
        return (<Projectboard secretData={this.state.secretData}/>);
    }

}

export default ProjectboardPage;
