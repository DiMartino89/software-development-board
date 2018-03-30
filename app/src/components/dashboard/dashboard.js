import React, {Component} from 'react';
import Moment from 'moment';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {getProjects, deleteProject, editProject} from '../../redux/modules/project';
import {editUser, getUsers} from "../../redux/modules/user";
import PropTypes from "prop-types";

export class Dashboard extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        updateUser: PropTypes.func,
        deleteTicket: PropTypes.func,
        deleteProject: PropTypes.func,
    };

    componentDidMount() {
        this.props.loadProjects();
        this.props.loadUsers();
    };

    getUser = (id) => {
        return this.props.users[id];
    };

    updateUser = (id, data) => {
        this.props.updateUser(id, data);
    };

    deleteTicket = (tId) => {
        const projectData = this.props.project;
        const id = projectData.id;
        delete projectData.id;
        projectData.tickets.splice(tId, 1);
        this.props.deleteTicket(id, projectData);
        location.reload();
    };

    deleteProject = (id) => {
        this.props.deleteProject(id);
    };

    render = () => {
        Moment.locale('de');
        if (!this.props.projects && !this.props.user) {
            return null;
        } else {
            const state = ['Offen', 'In Arbeit', 'To Review', 'In Review', 'Freigabe', 'Geschlossen'];
            const category = ['Keine Kategorie', 'Story', 'FE-Task', 'BE-Task'];
            const priority = ['Keine Priorität', 'Low', 'Medium', 'High', 'Blocker'];
            const projects = this.props.projects;
            const userId = this.props.user.id;
            const $this = this;

            return (
                <div>
                    <h2 className="dashboard__headline">Dashboard</h2>
                    <div className="dashboard__container">
                        <ul>
                            <div className="dashboard__list-header">ID</div>
                            <div className="dashboard__list-header">Name</div>
                            <div className="dashboard__list-header">Projektinhaber</div>
                            <div className="dashboard__list-header">Projektstart</div>
                            <div className="dashboard__list-header">Livegang</div>
                            <div className="dashboard__list-header">Link</div>
                            {Object.keys(projects).map(function (key, index) {
                                const isProjectOwner = projects[key].users[0] === userId;
                                const projectOwner = $this.getUser(projects[key].users[0]);
                                if (projects[key].users.includes(userId)) {
                                    return <li className="dashboard__list-item">
                                        <div className="dashboard__list-info">{key.substring(0, 10)}</div>
                                        <div className="dashboard__list-info">{projects[key].name}</div>
                                        <div
                                            className="dashboard__list-info">{projectOwner.firstName} {projectOwner.lastName}</div>
                                        <div
                                            className="dashboard__list-info">{Moment(projects[key].begin).format('DD.MM.YYYY')}</div>
                                        <div
                                            className="dashboard__list-info">{Moment(projects[key].end).format('DD.MM.YYYY')}</div>
                                        <div className="dashboard__list-info">
                                            <Link className="inline" to={"/project/" + key} title="Show Project"><i
                                                className="material-icons">visibility</i></Link>
                                            {isProjectOwner ? <button onClick={() => $this.deleteProject(key)}
                                                                      className="button is-primary">Delete
                                                Project</button> : ''}
                                        </div>
                                        <div className="dashboard__ticket-container">
                                            <div className="dashboard__sublist-header">ID</div>
                                            <div className="dashboard__sublist-header">Name</div>
                                            <div className="dashboard__sublist-header">Status</div>
                                            <div className="dashboard__sublist-header">Kategorie</div>
                                            <div className="dashboard__sublist-header">Priorität</div>
                                            <div className="dashboard__sublist-header">Link</div>
                                            {_.map(_.range(projects[key].tickets.length), function (i) {
                                                const ticketOwner = projects[key].tickets[i].originUser === userId;
                                                if (projects[key].tickets[i].user === userId) {
                                                    return <div>
                                                        <div
                                                            className="dashboard__ticket-item">{projects[key].tickets[i].id}</div>
                                                        <div
                                                            className="dashboard__ticket-item">{projects[key].tickets[i].name}</div>
                                                        <div
                                                            className="dashboard__ticket-item">{state[projects[key].tickets[i].state]}</div>
                                                        <div
                                                            className="dashboard__ticket-item">{category[projects[key].tickets[i].category]}</div>
                                                        <div
                                                            className="dashboard__ticket-item">{priority[projects[key].tickets[i].priority]}</div>
                                                        <div className="dashboard__ticket-item">
                                                            <Link className="inline"
                                                                  to={"/ticket/" + key + '-' + projects[key].tickets[i].id}
                                                                  title="Show Project"><i
                                                                className="material-icons">visibility</i></Link>
                                                            {ticketOwner ? <button onClick={() => $this.deleteTicket(i)}
                                                                                   className="button is-primary">Ticket löschen</button> : ''}
                                                        </div>
                                                    </div>
                                                }
                                            })}
                                        </div>
                                    </li>
                                }
                            })}
                        </ul>
                    </div>
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
        deleteProject: (id) => {
            dispatch(deleteProject(id));
        },
        deleteTicket: (id, formData) => {
            dispatch(editProject(id, formData));
        },
        loadUsers: () => {
            dispatch(getUsers());
        },
        updateUser: (id, formData) => {
            dispatch(editUser(id, formData));
        }
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
