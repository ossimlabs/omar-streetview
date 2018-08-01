import React, { Component } from "react";
import { SERVER_URL } from "../../config";
import { withRouter } from "react-router-dom";
import "whatwg-fetch";

import "./Streetview.css";

class Streetview extends Component {
  constructor(props) {
    super(props);

    const _this = this;
    this.viewer = null;
    this.loadedHotspots = null;
    this.previousHotSpots = null;
    // The event object from the click event is passed as the first argument,
    // as is documented. We don't need to use the event object,
    // but we do need a placeholder for it, since the parameters are positional
    _this.handleHotspot = (e, svid) => {
      //console.log("_this.handleHotspot: ", svid);
      this.props.setUrlSvid(svid);
    };
  }

  handleGetStreetview = (svid, metadata) => {
    const _this = this;

    try {
      //console.log(metadata);
      _this.loadedHotspots = this.formatHotSpotsMetadata(metadata);
    } catch (err) {
      console.error(err.message);
      this.props.history.push(`/error`);
      return;
    }

    let yaw = 0;
    if (this.previousHotSpots !== null) {
      this.previousHotSpots.map(function(m) {
        //console.log("m: ", m);
        return _this.viewer.removeHotSpot(m.id);
      });
      yaw = _this.viewer.getYaw();
    }
    _this.viewer = window.pannellum.viewer("panorama", {
      type: "equirectangular",
      panorama: `${SERVER_URL}/streetView/getImage?svid=${svid}`,
      autoLoad: true,
      compass: true,
      yaw: yaw,
      //hotSpotDebug: true,
      hotSpots: this.loadedHotspots
    });

    this.sceneLoadListener = () => {
      this.previousHotSpots = _this.loadedHotspots.slice();
      _this.props.handleMapData(_this.viewer.getYaw());
    };

    this.viewer.on("load", this.sceneLoadListener);

    this.sceneMouseUpListener = event => {
      //console.log(_this.viewer.getYaw());
      _this.props.handleMapData(_this.viewer.getYaw());
    };
    this.viewer.on("mouseup", this.sceneMouseUpListener);
  };

  formatHotSpotsMetadata = metadata => {
    const nearPoints = JSON.parse(metadata.properties.near_point);
    //console.log(nearPoints);

    // Modify point with metadata params,
    // push to new array
    const modPoints = nearPoints.map(m => {
      //console.log("m: ", m);
      let point = {
        id: null,
        pitch: 6,
        yaw: null,
        // type: "info",
        // text: null,
        cssClass: "hotspot-nav",
        clickHandlerFunc: this.handleHotspot,
        clickHandlerArgs: null
      };

      point.id = m.svid;
      point.yaw = m.dir - metadata.properties.dir; // This needs to be passed in and subtracted
      // point.text = m.svid;
      point.clickHandlerArgs = m.svid;
      //console.log(point);
      return point;
    });
    return modPoints;
  };

  componentDidMount() {
    //this.formatHotSpotsMetadata(this.props.metadata);
    this.handleGetStreetview(this.props.svid, this.props.metadata);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.svid !== this.props.svid) {
      //console.log("newProps in StreetView: ", newProps);
      this.handleGetStreetview(newProps.svid, newProps.metadata);
    }
  }

  render() {
    return (
      <div id="streetview">
        <div id="panorama" />
      </div>
    );
  }
}

export default withRouter(Streetview);
