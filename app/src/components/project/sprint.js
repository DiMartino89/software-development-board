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
import {editUser} from '../../redux/modules/user';
import Modal from 'react-responsive-modal';
import Moment from 'moment';
import FontAwesome from 'react-fontawesome';

const ReactGridLayout = WidthProvider(RGL);

const form = reduxForm({
    form: 'createTicket',
});

export class SingleSprint extends Component {
    constructor(props) {
        super(props);

        const layout = this.generateLayout();

        this.state = {
            layout: layout,
            open: false,
            currentTicket: null,
            droppedTicket: null
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

    createOptions() {
        if (!this.props.project) {
            return null;
        } else {
            const options = [];
            for (let i = 0; i < this.props.project.users.length; i++) {
                const option = {
                    value: i + 1,
                    label: this.props.project.users[i].firstName + ' ' + this.props.project.users[i].lastName,
                    id: this.props.project.users[i].id,
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

    componentDidMount() {
        this.props.loadProject();
    };

    onOpenModal = () => {
        this.setState({open: true});
    };

    onCloseModal = () => {
        this.setState({open: false});
    };

    onSprintChange = obj => {
        window.location.href = window.location.href + '_' + obj.value;
    };

    onUserChange = (tId, obj) => {
        const projectData = this.props.project;

        // Setup Data for old User
        const oldUserData = projectData.tickets[tId].user;
        if (Object.keys(oldUserData).length !== 0) {
            const oldUserId = oldUserData.id;
            for (let i = 0; i < oldUserData.tickets.length; i++) {
                if (oldUserData.tickets[i].project === this.props.project.id && oldUserData.tickets[i].ticket === tId) {
                    oldUserData.tickets.splice(i, 1);
                }
            }
            this.props.updateUser(oldUserId, oldUserData);
        }

        // Setup Data for new User
        const newUserData = this.props.project.users[obj.value - 1];
        const newUserId = newUserData.id;
        const ticket = {project: this.props.project.id, ticket: tId};
        newUserData.tickets.push(ticket);
        this.props.updateUser(newUserId, newUserData);

        // Setup Data for Ticket
        const id = window.location.href.split('/')[4];
        delete projectData.id;
        projectData.tickets[tId].user = obj.value === 0 ? {} : this.props.project.users[obj.value - 1];
        this.props.updateTicket(id, projectData);
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
            // Set new sprint
            if (projectData.sprints.length !== 0 && layout[this.state.droppedTicket].x < 5) {
                projectData.tickets[this.state.droppedTicket].sprint = [];
                for (let i = 0; i < projectData.sprints.length; i++) {
                    if (projectData.sprints[i].isActive) {
                        projectData.sprints[i].tickets.push(projectData.tickets[this.state.droppedTicket]);
                        projectData.tickets[this.state.droppedTicket].sprint.push(projectData.sprints[i]);
                    }
                }
            }
            if (projectData.tickets[this.state.droppedTicket].user === {}) {
                // If ticket has no current user
                projectData.tickets[this.state.droppedTicket].user = this.props.user;
                const userData = this.props.user;
                const userId = userData.id;
                const ticket = {project: this.props.project.id, ticket: this.state.droppedTicket};
                userData.tickets.push(ticket);
                this.props.updateUser(userId, userData);
            } else {
                // If ticket has current user
                const userData = projectData.tickets[this.state.droppedTicket].user;
                const userId = userData.id;
                const ticket = {project: this.props.project.id, ticket: this.state.droppedTicket};
                userData.tickets.push(ticket);
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
        formProps.user = {};
        formProps.createdAt = Moment(new Date()).format('DD.MM.YYYY HH:mm');
        formProps.updatedAt = Moment(new Date()).format('DD.MM.YYYY HH:mm');
        formProps.sprint = [this.props.project.sprints[window.location.href.split('-')[1]]];
        formProps.logging = [];
        formProps.files = [];
        formProps.comments = [];
        formData.tickets.push(formProps);
        formData.sprints[window.location.href.split('-')[1]].tickets.push(formProps);
        this.props.createTicket(id, formData);
    };

    generateDOM() {
        if (!this.props.project) {
            return null;
        } else {
            const options = this.createOptions();
            const tickets = this.props.project.sprints[window.location.href.split('-')[1]].tickets;
            const prefix = this.props.project.prefix;
            const currProject = window.location.href.split('/')[4].split('-')[0];
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

            return _.map(_.range(tickets.length), function (i) {
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
                                src={Object.keys(tickets[i].user).length !== 0 ? tickets[i].user.avatar : apiUrl + 'default.png'}
                                className="ticket__user-image"
                                style={divStyle}
                                title={Object.keys(tickets[i].user).length !== 0 ? tickets[i].user.firstName + ' ' + tickets[i].user.lastName : 'Kein Bearbeiter'}
                            />
                        </div>
                        <div className="ticket__row">
                            <Select
                                id="user-select"
                                options={options}
                                name="selected-user"
                                value={options[Object.keys(tickets[i].user).length !== 0 ? getCurrOption(tickets[i].user.id) : 0]}
                                onChange={(e) => $this.onUserChange(tickets[i].id, e)}
                                searchable={true}
                            />
                        </div>
                    </div>
                );
            });
        }
    }

    generateLayout() {
        if (!this.props.project) {
            return null;
        } else {
            if (this.props.project.sprints[window.location.href.split('-')[1]].tickets.length > 0) {
                return _.map(this.props.project.sprints[window.location.href.split('-')[1]].tickets, function (item, i) {
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

        if (!this.props.project) {
            return null;
        } else {
            const project = this.props.project;
            const options = this.createOptions2();
            const $this = this;
            this.state.layout = this.generateLayout();
            return (
                <div>
                    <div className="col-lg-12">
                        <p>{project.name}</p>
                        <button onClick={this.onOpenModal}>Create Ticket</button>
                        <Select
                            id="sprint-select"
                            options={options}
                            name="selected-sprint"
                            value={options[0]}
                            onChange={(e) => $this.onSprintChange(e)}
                            searchable={true}
                        />
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
                            formSpec={SingleSprint.formSpec}
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
        /*errors: state.project.errors[EDIT_PROJECT],
        message: state.project.messages[EDIT_PROJECT],
        loading: state.project.loading[EDIT_PROJECT],*/
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadProject: () => {
            dispatch(getProject(window.location.href.split('/')[4].split('-')[0]));
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

export default connect(mapStateToProps, mapDispatchToProps)(form(SingleSprint));