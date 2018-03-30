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
import {editUser, getUsers} from '../../redux/modules/user';
import Modal from 'react-responsive-modal';
import Moment from 'moment';

const ReactGridLayout = WidthProvider(RGL);

const form = reduxForm({
    form: 'createTicket',
});

export class Backlog extends Component {
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
            projectData.tickets[this.state.droppedTicket].sprint = layout[this.state.droppedTicket].x - 1;
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

    generateHead() {
        if (!this.props.project) {
            return null;
        } else {
            const sprints = this.props.project.sprints;
            const amount = this.props.project.sprints.length;
            const colStyle = {
                width: ((amount + 1) * 197) / (amount + 1)
            };
            return _.map(_.range(sprints.length), function (i) {
                return (
                    <div className="backlog__col" style={colStyle}>
                        {sprints[i].id} - {sprints[i].name}
                    </div>
                );
            });
        }
    }

    generateDOM() {
        if (!this.props.project && !this.props.users) {
            return null;
        } else {
            const options = this.createOptions();
            const tickets = this.props.project.tickets;
            const prefix = this.props.project.prefix;
            const currProject = window.location.href.split('/')[4];
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
                                <div className="ticket__category">
                                    {tickets[i].category === "1" ? <i className="material-icons" title="Story">speaker_notes</i> : ''}
                                    {tickets[i].category === "2" ? <i className="material-icons" title="FE-Task">web</i> : ''}
                                    {tickets[i].category === "3" ? <i className="material-icons" title="BE-Task">developer_board</i> : ''}
                                </div>
                                <div className="ticket__priority">
                                    {tickets[i].priority === "1" ? <i className="material-icons p-1" title="Low">arrow_downward</i> : ''}
                                    {tickets[i].priority === "2" ? <i className="material-icons p-2" title="Medium">radio_button_unchecked</i> : ''}
                                    {tickets[i].priority === "3" ? <i className="material-icons p-3" title="High">priority_high</i> : ''}
                                    {tickets[i].priority === "4" ? <i className="material-icons p-4" title="Blocker">do_not_disturb_alt</i> : ''}
                                </div>
                            </div>
                            <div className="ticket__row">
                                <p className="ticket__name">{tickets[i].name}</p>
                            </div>
                            <div className="ticket__row">
                                <p className="ticket__user-label">Bearbeiter:</p>
                                <img
                                    src={Object.keys(user).length !== 0 ? user.avatar : apiUrl + 'default.png'}
                                    className="user-avatar"
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
                        x: item.sprint !== "" ? (item.sprint + 1) : 0,
                        y: i,
                        w: 1,
                        h: 4,
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
            const amount = this.props.project.sprints.length;
            const layoutStyle = {
                width: ((amount + 1) * 207) + 10
            };
            const colStyle = {
                width: ((amount + 1) * 197) / (amount + 1)
            };
            this.state.layout = this.generateLayout();
            return (
                <div className="backlog">
                    <div className="col-lg-12">
                        <h2>{project.name}</h2>
                        <button onClick={this.onOpenModal} className="button is-primary">Ticket erstellen</button>
                    </div>
                    <div className="backlog__head" style={layoutStyle}>
                        <div className="backlog__col" style={colStyle}>Offen</div>
                        {this.generateHead()}
                    </div>
                    <ReactGridLayout
                        layout={this.state.layout}
                        {...this.props}
                        cols={this.props.project.sprints.length + 1}
                        onLayoutChange={this.onLayoutChange}
                        onDragStop={this.onDragStop}
                        style={layoutStyle}
                    >
                        {this.generateDOM()}
                    </ReactGridLayout>
                    <Modal open={open} onClose={this.onCloseModal} little>
                        <h2>Create Ticket</h2>
                        <GenericForm
                            onSubmit={() => handleSubmit(this.handleFormSubmit)}
                            //errors={errors}
                            //message={message}
                            formSpec={Backlog.formSpec}
                            submitText="Erstellen"
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

export default connect(mapStateToProps, mapDispatchToProps)(form(Backlog));