import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {editUser, getUsers} from '../../redux/modules/user';
import {logoutUser} from '../../redux/modules/authentication';
import {mobileBreakpoint} from '../../constants/ui-constants';
import {editProject, getProjects} from "../../redux/modules/project";
import $ from 'jquery';

class Header extends Component {
    state = {
        isMobile: window.innerWidth <= mobileBreakpoint,
        isLogin: window.location.href.indexOf("login") > -1,
        isRegister: !window.location.href.indexOf("register") > -1,
        mobileNavOpen: false,
    };

    componentWillMount = () => {
        window.addEventListener('resize', this.mobileCheck);
    };

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.mobileCheck);
    };

    componentDidMount() {
        if (!this.state.isLogin || !this.state.isRegister) {
            this.props.loadProjects();
            this.props.loadUsers();
        }
    };

    getUser = id => {
        return this.props.users[id];
    };

    getProject = id => {
        return this.props.projects[id];
    };

    mobileCheck = () => this.setState({isMobile: window.innerWidth <= mobileBreakpoint});

    buildNavigation = () => {
        const {user} = this.props;

        const links = [
            {
                name: 'Dashboard',
                link: '/dashboard',
                authenticated: true,
            },
            {
                name: 'Create',
                link: '/project/create',
                authenticated: true,
            },
            {
                name: 'Invitations',
                onClick: this.openInvitations,
                authenticated: true,
            },
            {
                name: 'Avatar',
                link: '',
                authenticated: true,
            },
            {
                name: 'Logout',
                onClick: this.props.logoutUser,
                authenticated: true,
            },
            {
                name: 'Login',
                link: '/login',
                authenticated: false,
            },
            {
                name: 'Register',
                link: '/register',
                authenticated: false,
            },
        ];

        return (
            <ul>
                {links.filter(link => link.authenticated === this.props.authenticated).map(link => {
                    if (user && link.name === 'Dashboard') {
                        return <li key={link.name}>
                            <a href={link.link} title="Dashboard"><i className="material-icons">dashboard</i></a>
                        </li>
                    } else if (user && link.name === 'Create') {
                        return <li key={link.name}>
                            <a href={link.link} title="Create Project"><i className="material-icons">create</i></a>
                        </li>
                    } else if (user && link.name === 'Invitations') {
                        return <li key={link.name}>
                            <span onClick={link.onClick} title="Invitations"><i
                                className="material-icons">mail {user.invitations.length > 0 ?
                                <div className="news__icon"><span>{user.invitations.length}</span>
                                </div> : ''}</i></span>
                        </li>
                    } else if (user && link.name === 'Avatar') {
                        return <li key={link.name}>
                            <a href={'/user/' + user.id} title="Profile"><img src={user.avatar}/></a>
                        </li>
                    } else if (user && link.name === 'Logout') {
                        return <li key={link.name}>
                            <a href="javascript:void(null);" onClick={link.onClick} title="Logout"><i
                                className="material-icons">exit_to_app</i></a>
                        </li>
                    } else {
                        return <li key={link.name}>
                            {link.link && <Link to={link.link}>{link.name}</Link>}
                            {link.onClick &&
                            <a href="javascript:void(null);" onClick={link.onClick}>{link.name}</a>}
                        </li>
                    }
                })}
            </ul>
        );
    };

    openInvitations = () => {
        // Toggle the invitation-panel
        $('#invitation-panel').fadeToggle();
    };

    signToProject = (index, pId) => {
        // Update User Data - Remove invitation
        const userData = this.props.user;
        const userId = userData.id;
        delete userData.id;
        userData.invitations.splice(index, 1);
        this.props.updateUser(userId, userData);

        // Update Project Data - Add user to project
        const projectData = this.getProject(pId);
        const projectId = projectData.id;
        delete projectData.id;
        projectData.users.push(userId);
        this.props.updateProject(projectId, projectData);

        // Reload the current page
        location.reload();
    };

    refuseInvitation = (index) => {
        // Update User Data - Only remove invitation
        const userData = this.props.user;
        const userId = userData.id;
        delete userData.id;
        userData.invitations.splice(index, 1);
        this.props.updateUser(userId, userData);
    };

    toggleMobileNav = () => this.setState({mobileNavOpen: !this.state.mobileNavOpen});

    render() {
        const {isMobile, mobileNavOpen} = this.state;
        const {user} = this.props;
        const $this = this;
        return (
            <header className="clearfix">
                <strong className="logo left"><img src="../../assets/img/sdb-logo.png" className="app-logo"/></strong>
                {isMobile &&
                <a
                    href="javascript:void(null);"
                    role="button"
                    className="mobile-nav-toggle clearfix right material-icons"
                    onClick={this.toggleMobileNav}
                    aria-label="Toggle navigation"
                >
                    {mobileNavOpen ? 'close' : 'menu'}
                </a>
                }
                <nav
                    className={`main-navigation right ${isMobile ? `mobile ${mobileNavOpen ? 'is-expanded' : ''}` : ''}`}>
                    {this.buildNavigation()}
                </nav>
                <div id="invitation-panel" className="invitation-panel">
                    <ul>
                        {user && user.invitations.length === 0 ? 'Aktuell keine Einladungen' : ''}
                        {user && _.map(_.range(user.invitations.length), function (i) {
                            const invUser = $this.getUser(user.invitations[i].user);
                            const project = $this.getProject(user.invitations[i].project);
                            return <li className="file__item">
                                <span>from: {invUser.firstName} {invUser.lastName}</span>
                                <span>for: {project.name}</span>
                                <button onClick={() => $this.signToProject(i, project.id)}
                                        className="button is-primary">✔
                                </button>
                                <button onClick={() => $this.refuseInvitation(i)} className="button is-primary">X
                                </button>
                            </li>
                        })}
                    </ul>
                </div>
            </header>
        );
    }
}

Header.propTypes = {
    authenticated: PropTypes.bool,
    updateUser: PropTypes.func,
    logoutUser: PropTypes.func,
    updateProject: PropTypes.func
};

const mapStateToProps = (state) => {

    return {
        user: state.user.user,
        users: state.user.users,
        projects: state.project.projects,
        authenticated: state.authentication.authenticated,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadProjects: () => {
            dispatch(getProjects());
        },
        loadUsers: () => {
            dispatch(getUsers());
        },
        updateProject: (id, formData) => {
            dispatch(editProject(id, formData));
        },
        updateUser: (id, formData) => {
            dispatch(editUser(id, formData));
        },
        logoutUser: () => {
            dispatch(logoutUser());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);