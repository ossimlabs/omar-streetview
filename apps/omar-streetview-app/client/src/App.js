import React from "react";
import "whatwg-fetch";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
//import { CONTEXT_PATH } from "./config";

import "./App.css";

import NavTop from "./components/NavTop/NavTop";
import Main from "./components/Main/Main";
import Error from "./components/Error/Error";

const App = () => {
  console.log(`PUBLIC_URL: ${process.env.PUBLIC_URL}`);
  return (
    <div className="container-fluid">
      <NavTop />
      <Router basename={"/omar-streetview"}>
        <div>
          <Switch>
            <Route exact path={`/streetview/:svid`} component={Main} />
            <Route path={`/error`} component={Error} />
          </Switch>
        </div>
      </Router>
    </div>
  );
};

export default App;
