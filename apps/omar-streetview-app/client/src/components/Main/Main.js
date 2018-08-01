//import { SERVER_URL, CONTEXT_PATH } from "../../config";
import React, { Component } from "react";
import { Collapse, Tooltip, OverlayTrigger } from "react-bootstrap";
import "whatwg-fetch";

import "./Main.css";
import OlMap from "../OlMap/OlMap";
import Streetview from "../Streetview/Streetview";

class Main extends Component {
  constructor(props) {
    super(props);
    this.svid = props.match.params.svid;
    //console.log("SVID: ", this.svid);
    this.state = {
      streetViewMetadata: [],
      direction: [],
      overviewMapOpen: true
    };
  }

  fetchStreetViewMetadata = svid => {
    // console.log('location', CONTEXT_PATH);
    //console.log(`fetchStreetViewMetadata: ${svid}`);

    fetch(`http://localhost:8080/omar-streetview/streetView?svid=${svid}`)
      .then(r => r.json())
      .then(json => {
        if (json.error === 500) {
          this.props.history.push(`/error`);
        }
        //console.log(json);
        this.setState({ streetViewMetadata: json });
        this.setState({ direction: json.properties.dir });
        //console.log("this.state: ", this.state);
      })
      .catch(error => console.error("Error connecting to server: " + error));
    //this.props.history.push(`/${svid}`);
  };

  handleSetUrlSvid = svid => {
    this.props.history.push(`/streetview/${svid}`);
  };

  handleMapData = data => {
    this.setState({ direction: data });
    //console.log("handleMapData: ", this.state.direction);
  };

  handleToggleOverviewMap = () => {
    this.setState({ overviewMapOpen: !this.state.overviewMapOpen });
  };

  componentDidMount() {
    this.fetchStreetViewMetadata(this.svid);
  }

  componentWillReceiveProps(newProps) {
    this.fetchStreetViewMetadata(newProps.match.params.svid);
  }

  render() {
    if (this.state.streetViewMetadata.length === 0) {
      return <p>Loading application. Please wait...</p>;
    }
    const m = this.state.streetViewMetadata;

    const overViewMapTooltip = (
      <Tooltip id="tooltip">
        <strong>Toggle the overview map</strong>
      </Tooltip>
    );

    const downloadTooltip = (
      <Tooltip id="tooltip">
        <strong>Download the current streetview image</strong>
      </Tooltip>
    );

    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <div
              id="btnMapOverview"
              className="btn-group"
              role="group"
              aria-label="Basic example"
            >
              <OverlayTrigger placement="left" overlay={overViewMapTooltip}>
                <button
                  onClick={this.handleToggleOverviewMap}
                  type="button"
                  className="btn btn-success"
                >
                  <span
                    className="glyphicon glyphicon-globe"
                    aria-hidden="true"
                  />
                </button>
              </OverlayTrigger>
              <OverlayTrigger placement="bottom" overlay={downloadTooltip}>
                <a
                  id="btnDownload"
                  className="btn btn-success"
                  href={`/streetView/getImage?svid=${
                    m.properties.svid
                  }&download=true`}
                  download
                >
                  <span
                    className="glyphicon glyphicon-download-alt"
                    aria-hidden="true"
                  />
                </a>
              </OverlayTrigger>
            </div>

            <Collapse in={this.state.overviewMapOpen} appear={true}>
              <OlMap
                id="mapComponent"
                metadata={m}
                mapData={this.state.direction}
              />
            </Collapse>

            <Streetview
              fetchMetadata={this.fetchStreetViewMetadata}
              setUrlSvid={this.handleSetUrlSvid}
              metadata={m}
              svid={m.properties.svid}
              handleMapData={this.handleMapData}
              mapData={this.state.direction}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
