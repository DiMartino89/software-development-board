import React from 'react';
import {Route, Switch} from 'react-router-dom';
import Login from '../components/authentication/login';
import Register from '../components/authentication/register';
import ForgotPassword from '../components/authentication/forgot-password';
import ResetPassword from '../components/authentication/reset-password';
import RequireAuth from '../components/hoc/require-auth';
import AuthenticatedRoutes from './authenticated/index';
import CreateProject from '../components/project/create';
import GetProjects from '../components/project/getAll';
import Board from "../components/project/ticket";
import SingleTicket from "../components/project/singleTicket";
import SingleSprint from "../components/project/sprint";
import UserProfile from "../components/user/user";

const TopLevelRoutes = () => (
    <Switch>
        <Route exact path="/login" component={Login}/>
        <Route exact path="/register" component={Register}/>
        <Route exact path="/forgot-password" component={ForgotPassword}/>
        <Route path="/reset-password/:token" component={ResetPassword}/>
        <Route path="/dashboard" component={RequireAuth(AuthenticatedRoutes)}/>
        <Route path="/user/:id" component={RequireAuth(UserProfile)}/>
        <Route path="/project/create" component={RequireAuth(CreateProject)}/>
        <Route path="/projects" component={RequireAuth(GetProjects)}/>
        <Route path="/project/:id" component={RequireAuth(Board)}/>
        <Route path="/sprint/:id" component={RequireAuth(SingleSprint)}/>
        <Route path="/ticket/:id" component={RequireAuth(SingleTicket)}/>
    </Switch>
);

export default TopLevelRoutes;
