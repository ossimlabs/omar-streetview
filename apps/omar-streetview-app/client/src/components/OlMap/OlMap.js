import React, { Component } from "react";
import { SERVER_URL } from "../../config";

import "ol/ol.css";
import Map from "ol/map";
import View from "ol/view";
import TileLayer from "ol/layer/tile";
import TileWMS from "ol/source/tilewms";
import VectorLayer from "ol/layer/vector";
import VectorSource from "ol/source/vector";
import Feature from "ol/feature";
import Point from "ol/geom/point";
import Style from "ol/style/style";
import Icon from "ol/style/icon";

import "./OlMap.css";

class OlMap extends Component {
  componentDidMount() {
    const initLon = this.props.metadata.properties.lon;
    const initLat = this.props.metadata.properties.lat;

    const baseMapLayer = new TileLayer({
      source: new TileWMS({
        url: `https://omar-rel.ossim.io/omar-mapproxy/service`,
        params: {
          VERSION: "1.1.1",
          LAYERS: "o2-basemap-bright",
          FORMAT: "image/jpeg"
        }
      })
    });

    const streetviewLayer = new TileLayer({
      source: new TileWMS({
        url: `${SERVER_URL}/mapView/getTile`,
        params: {
          LAYERS: "road_streetview_subset",
          FORMAT: "image/png"
        }
      })
    });

    this.currentFeature = new Feature({
      name: "Current Loc",
      geometry: new Point([initLon, initLat])
    });

    const currentLocLayer = new VectorLayer({
      source: new VectorSource({
        features: [this.currentFeature]
      }),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 0.8],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction",
          src: `${SERVER_URL}/libs/bluedot-icon-small.png`
          //src: "/libs/bluedot-icon-small.png"
        })
      })
    });

    this.map = new Map({
      target: "map",
      layers: [baseMapLayer, streetviewLayer, currentLocLayer],
      view: new View({
        projection: "EPSG:4326",
        center: [initLon, initLat],
        zoom: 18,
        rotation: this.convertRotation(this.props.mapData)
      })
    });
  }

  convertRotation(currentRotation) {
    let phaseConversion = currentRotation - this.props.metadata.properties.dir;
    if (phaseConversion < 0) {
      phaseConversion += 360;
    }
    let radianConversion = (phaseConversion * Math.PI) / 180;
    return Math.PI - radianConversion;
  }

  componentWillReceiveProps(newProps) {
    if (
      newProps.metadata.properties.lon !== this.props.metadata.properties.lon
    ) {
      const newLon = newProps.metadata.properties.lon;
      const newLat = newProps.metadata.properties.lat;
      this.currentFeature.getGeometry().setCoordinates([newLon, newLat]);
      this.map.getView().setCenter([newLon, newLat]);
    }

    if (newProps.mapData !== this.props.metadata.properties.dir) {
      const finalRotation = this.convertRotation(newProps.mapData);
      //console.log("Set view to: ", finalRotation, " radians");
      this.map.getView().setRotation(finalRotation);
    }
  }

  render() {
    return <div id="map" />;
  }
}

export default OlMap;
