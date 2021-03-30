import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom'; /*This library tells React what component to render based on the path entered, so SPA with multiple components that work as multiple pages */

import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import UpdateUser from './user/pages/UpdateUser';
import UpdateImage from './user/pages/UpdateImage';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import ActiveProfile from './user/pages/ActiveProfile';
import LifeExpress from './myle/pages/LifeExpress';
import Welcome from './user/pages/Welcome';
import Game from './games/pages/Game';
import ResetPssw from './user/pages/ResetPssw';
import ResetPsswForm from './user/pages/ResetPsswForm';
import ResendEmail from './user/pages/ResendEmail';

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  //token replaces is logged in
  if (token) {
    routes = (
      <Switch>
        {/*Added -> "Redirect" only if the paths are not defined */}
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/game" exact>
          <Game />
        </Route>
        <Route path="/:userId/places" exact>
          {/*Dynamic segments after the colon, parameters */}
          <UserPlaces />
        </Route>
        <Route path="/edit">
          {/*ISSUE: If wrote typed browser, redirects to '/'. Because it goes to the server -> rote not defined. Resolve woth route in the backend side.https://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writing-manually?rq=1   */}
          <UpdateUser />
        </Route>
        <Route path="/image">
          <UpdateImage />
        </Route>
        <Route path="/activ">
          <ActiveProfile />
        </Route>
        <Route path="/:uid/lexpress">
          <LifeExpress />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/confirm/:confirmationCode">
          <Welcome />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Route path="/resendemail">
          <ResendEmail />
        </Route>
        <Route path="/resetpssw">
          <ResetPssw />
        </Route>
        <Route path="/newpssw/:resetPsswCode">
          <ResetPsswForm />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
