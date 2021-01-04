import React from "react";
import "./App.css";
import GalleryPage from "./GalleryPage";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import About from "./About";
import Mint from "./Mint";
import Connect from "./Connect";
import store, { connectToStellar, disconnectFromStellar } from "./Store";
import { useAuger } from "auger-state";
import Profile from "./Profile";
import Piece from "./Piece";

function App() {
  const auger = useAuger(store);
  const { publicKey } = auger.account.$read();
  const profileLink = publicKey ? (
    [
      <Link to="/gallery">Your Gallery</Link>,
      <Link to="/profile">Profile</Link>,
    ]
  ) : (
    <a href="#" onClick={connectToStellar}>
      Connect with Freighter
    </a>
  );
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/about">About</Link>
          <Link to="/mint">Mint</Link>
          {profileLink}
        </nav>
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/connect">
            <Connect />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/mint">{publicKey ? <Mint /> : <Connect />}</Route>
          <Route path="/gallery/:account?">
            <GalleryPage />
          </Route>
          <Route path="/piece/:token">
            <Piece />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
