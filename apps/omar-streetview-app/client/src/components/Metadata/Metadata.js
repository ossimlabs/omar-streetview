import React, { Component } from "react";
import "whatwg-fetch";

import "./Metadata.css";

class Metadata extends Component {
  // constructor(props) {
  //   super(props);
  //   console.log("Metadata props: ", this.props);
  //   // this.state = {
  //   //   streetViewInfo: this.props.metadata
  //   // };
  // }

  render() {
    //const streetViewInfo = JSON.stringify(this.props.metadata);
    const m = this.props.metadata;

    const near_point = JSON.parse(m.properties.near_point);
    //console.log(near_point[0]);

    return (
      <div id="metadata">
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Metadata</h3>
                </div>
                <div className="panel-body">
                  <ul className="list-group">
                    <li className="list-group-item">
                      <small>SVID: {m.properties.svid}</small>
                    </li>
                    <li className="list-group-item">
                      <small>Direction: {m.properties.dir}</small>
                    </li>
                    <li className="list-group-item">
                      <small>Lat: {m.properties.lat}</small>
                    </li>
                    <li className="list-group-item">
                      <small>Lon: {m.properties.lon}</small>
                    </li>
                    <li className="list-group-item">
                      <small>Street Name: {m.properties.name}</small>
                    </li>
                    <li className="list-group-item">
                      <small>Point Behind SVID: {near_point[0].svid}</small>
                    </li>
                    <li className="list-group-item">
                      <small>Point Behind Direction: {near_point[0].dir}</small>
                    </li>
                    <li className="list-group-item">
                      <small>Point Ahead SVID: {near_point[1].svid}</small>
                    </li>
                    <li className="list-group-item">
                      <small>Point Ahead Direction: {near_point[1].dir}</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Metadata;
