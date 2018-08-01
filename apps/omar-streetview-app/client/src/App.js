import React from "react";
import "whatwg-fetch";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CONTEXT_PATH } from "./config";

import "./App.css";

import NavTop from "./components/NavTop/NavTop";
import Main from "./components/Main/Main";
import Error from "./components/Error/Error";

const App = () => {
  return (
    <div className="container-fluid">
      <NavTop />
      <Router>
        <div>
          <Switch>
            <Route
              exact
              path={`${CONTEXT_PATH}/streetview/:svid`}
              component={Main}
            />
            <Route path={`${CONTEXT_PATH}/error`} component={Error} />
          </Switch>
        </div>
      </Router>
    </div>
  );
};

export default App;
