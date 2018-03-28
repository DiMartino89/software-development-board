import React, {Component} from 'react';
import _ from "lodash";
import RGL, {WidthProvider} from "react-grid-layout";
import {connect} from "react-redux";
import TextInput from "../form-fields/text-input";
import Textarea from "../form-fields/text-area";
import StandardSelect from "../form-fields/select";
import Select from 'react-select';
import PropTypes from "prop-types";
import {reduxForm} from 'redux-form';
import {Link} from 'react-router-dom';
import GenericForm from '../form-fields/generic-form';
import {getProject, editProject} from '../../redux/modules/project';
import {getUsers, editUser} from '../../redux/modules/user';
import Modal from 'react-responsive-modal';
import Moment from 'moment';
import FontAwesome from 'react-fontawesome';

const ReactGridLayout = WidthProvider(RGL);

const form = reduxForm({
    form: 'createTicket',
});

export class Board extends Component {
    constructor(props) {
        super(props);

        const layout = this.generateLayout();

        this.state = {
            layout: layout,
            open: false,
            open2: false,
            currentTicket: null,
            droppedTicket: null,
            invitations: []
        };
    }

    static defaultProps = {
        className: "layout",
        items: 0,
        rowHeight: 30,
        cols: 6,
        verticalCompact: true,
        compactType: 'vertical',
        preventCollision: false,
        isResizable: false,
        isDraggable: true,
    };

    static propTypes = {
        handleSubmit: PropTypes.func,
        updateProject: PropTypes.func,
        createSprint: PropTypes.func,
        createTicket: PropTypes.func,
        updateTicket: PropTypes.func,
        updateUser: PropTypes.func,
        /*errors: errorPropTypes,
        message: PropTypes.string,
        loading: PropTypes.bool,*/
    };

    static formSpec = [
        {
            id: 'name',
            name: 'name',
            label: 'Ticketname',
            type: 'text',
            placeholder: 'Ticketname',
            component: TextInput
        },
        {
            id: 'description',
            name: 'description',
            label: 'Beschreibung',
            type: 'text',
            placeholder: '...',
            component: Textarea
        },
        {
            id: 'category',
            name: 'category',
            label: 'Kategorie',
            placeholder: 'Kategorie',
            children: [
                {value: 0, label: 'Keine Kategorie'},
                {value: 1, label: 'Story'},
                {value: 2, label: 'FE-Task'},
                {value: 3, label: 'BE-Task'}
            ],
            component: StandardSelect
        },
        {
            id: 'priority',
            name: 'priority',
            label: 'Priorität',
            placeholder: 'Priorität',
            children: [
                {value: 0, label: 'Keine Priorität'},
                {value: 1, label: 'Low'},
                {value: 2, label: 'Medium'},
                {value: 3, label: 'High'},
                {value: 3, label: 'Blocker'}
            ],
            component: StandardSelect
        },
        {
            id: 'estimation',
            name: 'estimation',
            label: 'Schätzung',
            type: 'number',
            placeholder: 'in h',
            component: TextInput
        },
    ];

    static formSpec2 = [
        {
            id: 'name',
            name: 'name',
            label: 'Sprintname',
            type: 'text',
            placeholder: 'Sprintname',
            component: TextInput
        },
        {
            id: 'begin',
            name: 'begin',
            label: 'Startdatum',
            type: 'date',
            placeholder: 'xx.xx.xxxx',
            component: TextInput
        },
        {
            id: 'end',
            name: 'end',
            label: 'Enddatum',
            type: 'date',
            placeholder: 'xx.xx.xxxx',
            component: TextInput
        },
    ];

    createOptions() {
        if (!this.props.project && !this.props.user) {
            return null;
        } else {
            const options = [];
            for (let i = 0; i < this.props.project.users.length; i++) {
                const user = this.getUser(this.props.project.users[i]);
                const option = {
                    value: i + 1,
                    label: user.firstName + ' ' + user.lastName,
                    id: user.id,
                    className: 'user-option'
                };
                options.push(option);
            }
            const defaultOption = {value: 0, label: 'Kein Bearbeiter', className: 'user-option'};
            options.unshift(defaultOption);
            return options;
        }
    };

    createOptions2() {
        if (!this.props.project) {
            return null;
        } else {
            const options = [];
            for (let i = 0; i < this.props.project.sprints.length; i++) {
                const option = {
                    value: i + 1,
                    label: this.props.project.sprints[i].name,
                    id: this.props.project.sprints[i].id,
                    className: 'user-option'
                };
                options.push(option);
            }
            const defaultOption = {value: 0, label: 'Kein Sprint ausgewählt', className: 'sprint-option'};
            options.unshift(defaultOption);
            return options;
        }
    };

    createOptions3() {
        if (!this.props.project) {
            return null;
        } else {
            const options = [];
            const $this = this;
            Object.keys(this.props.users).forEach(function (key, index) {
                if (!$this.props.project.users.includes(key)) {
                    const option = {
                        value: index + 1,
                        label: $this.props.users[key].firstName + ' ' + $this.props.users[key].lastName,
                        id: $this.props.users[key].id,
                        className: 'invite-option'
                    };
                    options.push(option);
                }
            });
            const defaultOption = {value: 0, label: 'Kein User ausgewählt', className: 'invite-option'};
            options.unshift(defaultOption);
            return options;
        }
    };

    componentDidMount() {
        this.props.loadProject();
        this.props.loadUsers();
    };

    getUser = id => {
        return this.props.users[id];
    };

    onOpenModal = () => {
        this.setState({open: true});
    };

    onCloseModal = () => {
        this.setState({open: false});
    };

    onOpenModal2 = () => {
        this.setState({open2: true});
    };

    onCloseModal2 = () => {
        this.setState({open2: false});
    };

    onSprintChange = obj => {
        window.location.href = 'http://localhost:8080/sprint/' + window.location.href.split('/')[4] + '-' + (obj.value - 1);
    };

    onUserChange = (tId, obj) => {
        const projectData = this.props.project;
        const ticketId = this.props.project.id + '-' + tId;
        const oldUserId = projectData.tickets[tId].user;
        // Delete ticket-reference from old editor if existing

        if (oldUserId !== '') {
            const oldUserData = this.getUser(oldUserId);
            for (let i = 0; i < oldUserData.tickets.length; i++) {
                if (oldUserData.tickets[i] === ticketId) {
                    oldUserData.tickets.splice(i, 1);
                }
            }
            this.props.updateUser(oldUserId, oldUserData);
        }
        if (obj.value !== 0) {
            // Setup Data for new User
            const newUserId = this.props.project.users[obj.value - 1];
            const newUserData = this.getUser(newUserId);
            const ticket = this.props.project.id + '-' + tId;
            newUserData.tickets.push(ticket);
            this.props.updateUser(newUserId, newUserData);
        }

        // Setup Data for Ticket
        const id = window.location.href.split('/')[4];
        delete projectData.id;
        projectData.tickets[tId].user = obj.value === 0 ? '' : this.props.project.users[obj.value - 1];
        this.props.updateTicket(id, projectData);
    };

    onInviteChange = obj => {
        let found = false;
        for (let i = 0; i < this.state.invitations.length; i++) {
            if (this.state.invitations[i].id === obj.id) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.state.invitations.push(obj);
            localStorage.setItem('invitations', JSON.stringify(this.state.invitations));
            location.reload();
        }
    };

    getInvitations = () => {
        if (localStorage.getItem("invitations") !== null && JSON.parse(localStorage.getItem("invitations")).length > 0) {
            this.state.invitations = JSON.parse(localStorage.getItem("invitations"));
        } else {
            this.state.invitations = [];
        }
    };

    removeUser = index => {
        this.state.invitations.splice(index, 1);
        localStorage.setItem('invitations', JSON.stringify(this.state.invitations));
        location.reload();
    };

    removeMember = (uId) => {
        const projectData = this.props.project;
        const id = projectData.id;
        delete projectData.id;
        const index = projectData.users.indexOf(uId);
        projectData.users.splice(index, 1);
        this.props.updateProject(id, projectData);
        location.reload();
    };

    onDragStop = (e, node) => {
        this.setState({droppedTicket: node.i});
    };

    onLayoutChange = layout => {
        this.setState({layout: layout});
        if (this.state.droppedTicket !== null) {
            // Prepare Ticket Update
            const projectData = this.props.project;
            const id = window.location.href.split('/')[4];
            delete projectData.id;
            projectData.tickets[this.state.droppedTicket].state = layout[this.state.droppedTicket].x;
            // Set current sprint if available and necessary
            if (projectData.sprints.length !== 0 && layout[this.state.droppedTicket].x < 5) {
                projectData.tickets[this.state.droppedTicket].sprint = [];
                for (let i = 0; i < projectData.sprints.length; i++) {
                    if (projectData.sprints[i].isActive) {
                        projectData.sprints[i].tickets.push(this.state.droppedTicket);
                        projectData.tickets[this.state.droppedTicket].sprint = projectData.sprints[i].id;
                    }
                }
            }
            // Update New Editor
            const currUserId = projectData.tickets[this.state.droppedTicket].user;
            if (currUserId === '') {
                // If ticket has no current user
                projectData.tickets[this.state.droppedTicket].user = this.props.user.id;
                const userData = this.props.user;
                const userId = userData.id;
                const ticketId = this.props.project.id + '-' + this.state.droppedTicket;
                userData.tickets.push(ticketId);
                this.props.updateUser(userId, userData);
            }
            this.props.updateTicket(id, projectData);
        }
    };

    handleFormSubmit = formProps => {
        const formData = this.props.project;
        const id = formData.id;
        delete formData.id;
        formProps.id = formData.tickets.length;
        formProps.state = 0;
        formProps.user = '';
        formProps.originUser = this.props.user.id;
        formProps.createdAt = Moment(new Date()).format('DD.MM.YYYY HH:mm');
        formProps.updatedAt = Moment(new Date()).format('DD.MM.YYYY HH:mm');
        formProps.sprint = '';
        formProps.logging = [];
        formProps.files = [];
        formProps.comments = [];
        formData.tickets.push(formProps);
        this.props.createTicket(id, formData);
    };

    handleFormSubmit2 = formProps => {
        const formData = this.props.project;
        const id = formData.id;
        delete formData.id;
        formProps.id = formData.sprints.length;
        formProps.isActive = true;
        formProps.tickets = [];
        formData.sprints.push(formProps);
        this.props.createSprint(id, formData);
    };

    inviteUsers = () => {
        for (let i = 0; i < this.state.invitations.length; i++) {
            const userData = this.getUser(this.state.invitations[i].id);
            const userId = userData.id;
            const formProps = {
                user: this.props.user.id,
                project: this.props.project.id
            };
            delete userData.id;
            let found = false;
            for (let i = 0; i < userData.invitations.length; i++) {
                if (userData.invitations[i].project === this.props.project.id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                userData.invitations.push(formProps);
                this.props.updateUser(userId, userData);
            }
        }
        this.state.invitations = [];
        localStorage.setItem('invitations', JSON.stringify(this.state.invitations));
        location.reload();
    };

    generateDOM() {
        if (!this.props.project && !this.props.users) {
            return null;
        } else {
            const options = this.createOptions();
            const tickets = this.props.project.tickets;
            const prefix = this.props.project.prefix;
            const currProject = window.location.href.split('/')[4];
            const divStyle = {
                width: '30px',
                height: '30px',
            };
            const apiUrl = "http://localhost:3000/";
            const $this = this;

            function getCurrOption(idKey, arr) {
                for (let i = 0; i < options.length; i++) {
                    if (options[i].id === idKey) {
                        return i;
                    }
                }
            }

            if (this.props.users.length !== 0) {
                return _.map(_.range(tickets.length), function (i) {
                    let user = {};
                    if (tickets[i].user !== '') {
                        user = $this.getUser(tickets[i].user);
                    }
                    return (
                        <div key={i}>
                            <div className="ticket__row">
                                <Link className="ticket__link" to={"/ticket/" + currProject + "-" + i}>
                                    <p className="ticket__name">{prefix + '-' + tickets[i].id}</p>
                                </Link>
                            </div>
                            <div className="ticket__row">
                                <p className="ticket__user-label">Bearbeiter:</p>
                                <img
                                    src={Object.keys(user).length !== 0 ? user.avatar : apiUrl + 'default.png'}
                                    className="ticket__user-image"
                                    style={divStyle}
                                    title={Object.keys(user).length !== 0 ? user.firstName + ' ' + user.lastName : 'Kein Bearbeiter'}
                                />
                            </div>
                            <div className="ticket__row">
                                <Select
                                    id="user-select"
                                    options={options}
                                    name="selected-user"
                                    value={options[Object.keys(user).length !== 0 ? getCurrOption(user.id) : 0]}
                                    onChange={(e) => $this.onUserChange(tickets[i].id, e)}
                                    searchable={true}
                                />
                            </div>
                        </div>
                    );
                });
            }
        }
    }

    generateLayout() {
        if (!this.props.project) {
            return null;
        } else {
            if (this.props.project.tickets.length > 0) {
                return _.map(this.props.project.tickets, function (item, i) {
                    return {
                        x: item.state ? item.state : 0,
                        y: i,
                        w: 1,
                        h: 3,
                        i: i.toString(),
                    };
                });
            } else {
                return [];
            }
        }
    }

    render = () => {
        const {handleSubmit, errors, message} = this.props;
        const {open} = this.state;
        const {open2} = this.state;

        if (!this.props.project) {
            return null;
        } else {
            const project = this.props.project;
            const currUser = this.props.user;
            const isCurrUser = project.users[0] === currUser.id;
            const id = project.id;
            const options = this.createOptions2();
            const options2 = this.createOptions3();
            this.state.layout = this.generateLayout();
            this.getInvitations();
            const $this = this;

            return (
                <div>
                    <div className="col-lg-12">
                        <h2>{project.name}</h2>
                        <button onClick={this.onOpenModal} className="button is-primary">Create Ticket</button>
                        <button onClick={this.onOpenModal2} className="button is-primary">Create Sprint</button>
                        {isCurrUser ? <button onClick={() => this.deleteProject} className="button is-primary">Delete
                            Project</button> : ''}
                        <Link className="inline" to={"/backlog/" + id}>Zum Backlog</Link>
                        <Select
                            id="sprint-select"
                            options={options}
                            name="selected-sprint"
                            value={options[0]}
                            onChange={(e) => $this.onSprintChange(e)}
                            searchable={true}
                        />
                        <h4>Mitglieder:</h4>
                        <ul id="members-list">
                            {_.map(_.range(project.users.length), function (i) {
                                const user = $this.getUser(project.users[i]);
                                return <li className="member__item">
                                    <span>{user.firstName} {user.lastName}</span>
                                    {isCurrUser ?
                                        <button onClick={() => $this.removeMember(project.users[i])}
                                                className="button is-primary">Remove</button> : ''}
                                </li>
                            })}
                        </ul>
                        <h4>Einladungen:</h4>
                        <Select
                            id="invitation"
                            options={options2}
                            name="invitation"
                            value={options2[0]}
                            onChange={(e) => $this.onInviteChange(e)}
                            searchable={true}
                        />
                        <ul id="invitations-list">
                            {_.map(_.range($this.state.invitations.length), function (i) {
                                return <li className="invitation__item">
                                    <span>{$this.state.invitations[i].label}</span>
                                    <button onClick={() => $this.removeUser} className="button is-primary">X</button>
                                </li>
                            })}
                        </ul>
                        <button onClick={this.inviteUsers} className="button is-primary">Einladen</button>
                    </div>
                    <div className="col-lg-2">Offen</div>
                    <div className="col-lg-2">In Arbeit</div>
                    <div className="col-lg-2">To Review</div>
                    <div className="col-lg-2">In Review</div>
                    <div className="col-lg-2">Freigabe</div>
                    <div className="col-lg-2">Geschlossen</div>
                    <ReactGridLayout
                        layout={this.state.layout}
                        {...this.props}
                        onLayoutChange={this.onLayoutChange}
                        onDragStop={this.onDragStop}
                    >
                        {this.generateDOM()}
                    </ReactGridLayout>
                    <Modal open={open} onClose={this.onCloseModal} little>
                        <h2>Create Ticket</h2>
                        <GenericForm
                            onSubmit={handleSubmit(this.handleFormSubmit)}
                            //errors={errors}
                            //message={message}
                            formSpec={Board.formSpec}
                            submitText="Create"
                        />
                    </Modal>
                    <Modal open={open2} onClose={this.onCloseModal2} little>
                        <h2>Create Sprint</h2>
                        <GenericForm
                            onSubmit={handleSubmit(this.handleFormSubmit2)}
                            //errors={errors}
                            //message={message}
                            formSpec={Board.formSpec2}
                            submitText="Create"
                        />
                    </Modal>
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        project: state.project.project,
        user: state.user.user,
        users: state.user.users,
        /*errors: state.project.errors[EDIT_PROJECT],
        message: state.project.messages[EDIT_PROJECT],
        loading: state.project.loading[EDIT_PROJECT],*/
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadProject: () => {
            dispatch(getProject(window.location.href.split('/')[4]));
        },
        loadUsers: () => {
            dispatch(getUsers());
        },
        updateProject: (id, formData) => {
            dispatch(editProject(id, formData));
        },
        createSprint: (id, formData) => {
            dispatch(editProject(id, formData));
        },
        createTicket: (id, formData) => {
            dispatch(editProject(id, formData));
        },
        updateTicket: (id, formData) => {
            dispatch(editProject(id, formData));
        },
        updateUser: (id, formData) => {
            dispatch(editUser(id, formData));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(form(Board));