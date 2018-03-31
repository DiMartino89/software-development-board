import React, {Component} from 'react';
import Moment from 'moment';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {getProjects} from '../../redux/modules/project';
import {getUsers} from "../../redux/modules/user";

export class GetProjects extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.loadProjects();
        this.props.loadUsers();
    };


    render = () => {
        Moment.locale('de');
        if (!this.props.projects && !this.props.user) {
            return null;
        } else {
            const projects = this.props.projects;
            return (
                <div>
                    <ul>
                        {Object.keys(projects).map(function (key, index) {
                            return <li>
                                <p>Project-ID: {key}</p>
                                <p>Name: {projects[key].name}</p>
                                <p>Beschreibung: {projects[key].description}</p>
                                <p>Projektstart: {Moment(projects[key].begin).format('DD.MM.YYYY')}</p>
                                <p>Livegang: {Moment(projects[key].end).format('DD.MM.YYYY')}</p>
                                <p>Tickets: {projects[key].tickets.length}</p>
                                <p>Link zum Projekt: <Link className="inline" to={"/project/" + key}>Zum Projekt</Link>
                                </p>
                            </li>
                        })}
                    </ul>
                </div>
            );
        }
    };
}

const mapStateToProps = (state) => {
    return {
        projects: state.project.projects,
        user: state.user.user,
        users: state.user.users,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadProjects: () => {
            dispatch(getProjects())
        },
        loadUsers: () => {
            dispatch(getUsers());
        },
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(GetProjects);
