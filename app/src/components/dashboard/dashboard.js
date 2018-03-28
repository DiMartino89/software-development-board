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
            const state = ['Offen','In Arbeit','To Review','In Review', 'Freigabe', 'Geschlossen'];
            const category = ['Keine Kategorie','Story','FE-Task','BE-Task'];
            const priority = ['Keine Priorität','Low','Medium','High','Blocker'];
            const projects = this.props.projects;
            const userId = this.props.user.id;
            const $this = this;
            return (
                <div>
                    <h2>Dashboard</h2>
                    <ul>
                        <div className="col-lg-2 list__header">ID</div>
                        <div className="col-lg-2 list__header">Name</div>
                        <div className="col-lg-2 list__header">Beschreibung</div>
                        <div className="col-lg-2 list__header">Projektstart</div>
                        <div className="col-lg-2 list__header">Livegang</div>
                        <div className="col-lg-2 list__header">Link</div>
                        {Object.keys(projects).map(function (key, index) {
                            const isProjectOwner = projects[key].users[0] === userId;
                            if (projects[key].users.includes(userId)) {
                                return <li className="list__item">
                                    <div className="col-lg-2 list__project">{key}</div>
                                    <div className="col-lg-2 list__project">{projects[key].name}</div>
                                    <div className="col-lg-2 list__project">{projects[key].description}</div>
                                    <div className="col-lg-2 list__project">{Moment(projects[key].begin).format('DD.MM.YYYY')}</div>
                                    <div className="col-lg-2 list__project">{Moment(projects[key].end).format('DD.MM.YYYY')}</div>
                                    <div className="col-lg-2 list__project">
                                        <Link className="inline" to={"/project/" + key}>Zum Projekt</Link>
                                        {isProjectOwner ? <button onClick={() => $this.deleteProject(key)} className="button is-primary">Delete
                                            Project</button> : ''}
                                    </div>
                                    <div className="col-lg-2 list__header">ID</div>
                                    <div className="col-lg-2 list__header">Name</div>
                                    <div className="col-lg-2 list__header">Status</div>
                                    <div className="col-lg-2 list__header">Kategorie</div>
                                    <div className="col-lg-2 list__header">Priorität</div>
                                    <div className="col-lg-2 list__header">Link</div>
                                        {_.map(_.range(projects[key].tickets.length), function (i) {
                                            const ticketOwner = projects[key].tickets[i].originUser === userId;
                                            if(projects[key].tickets[i].user === userId) {
                                                return <div>
                                                    <div className="col-lg-2 list__ticket">{projects[key].tickets[i].id}</div>
                                                    <div className="col-lg-2 list__ticket">{projects[key].tickets[i].name}</div>
                                                    <div className="col-lg-2 list__ticket">{state[projects[key].tickets[i].state]}</div>
                                                    <div className="col-lg-2 list__ticket">{category[projects[key].tickets[i].category]}</div>
                                                    <div className="col-lg-2 list__ticket">{priority[projects[key].tickets[i].priority]}</div>
                                                    <div className="col-lg-2 list__ticket">
                                                        <Link className="inline" to={"/ticket/" + key + '-' + projects[key].tickets[i].id}>Zum Ticket</Link>
                                                        {ticketOwner ? <button onClick={() => $this.deleteTicket(i)} className="button is-primary">Delete
                                                            Ticket</button> : ''}
                                                    </div>
                                                </div>
                                            }
                                        })}
                                </li>
                            }
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
