import React, { useEffect, useState } from "react";
import L from "leaflet";
//import "../node_modules/leaflet/dist/leaflet.css";
//import { Icon } from "leaflet";

import "./App.css";

var map;

function App() {
  const startZoomLevel = 10;
  const startPosition = [60.45451, 22.264824];

  const [foliBusStops, setFoliBusStops] = useState(null);
  const foliBusLocations = {};

  const foliBikeRacks = [];

  useEffect(() => {
    setInterval(() => {
      fetch("https://data.foli.fi/siri/vm")
        .then((response) => response.json())
        .then((data) => {
          //console.log(data);
          Object.keys(data.result.vehicles).forEach((key, index) => {
            if (data.result.vehicles[key].monitored === true) {
              if (foliBusLocations.hasOwnProperty(key)) {
                // console.log(foliBusLocations[key]);
                foliBusLocations[key].setLatLng(
                  new L.LatLng(
                    data.result.vehicles[key].latitude,
                    data.result.vehicles[key].longitude
                  )
                );
              } else {
                var busIcon = L.divIcon({
                  className: "bus-icon",
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                  html:
                    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>',
                });

                foliBusLocations[key] = L.marker(
                  [
                    data.result.vehicles[key].latitude,
                    data.result.vehicles[key].longitude,
                  ],
                  { icon: busIcon }
                ).bindPopup(data.result.vehicles[key].publishedlinename);
                //foliBusLocations[key].addTo(map);
              }
            }
          });
        })
        .then(() => {
          if (Object.keys(foliBusLocations).length !== 0) {
            //console.log(Object.values(foliBusLocations));

            var busLocationsLayer = L.layerGroup(
              Object.values(foliBusLocations)
            );
            // console.log(map.hasLayer(busLocationsLayer));
            if (map.hasLayer(busLocationsLayer)) {
            } else {
              //busLocationsLayer.addTo(map);
            }
            // if(!map.hasLayer(busLocationsLayer)){
            //   busLocationsLayer.addTo(map);
            // var busLocationsControl = {
            //   "Bus locations": busLocationsLayer,
            // };
            // L.control.layers(null, busLocationsControl).addTo(map);
            // }
            // console.log(map.hasLayer(busLocationsLayer));
          }
        });
    }, 5000);

    fetch("https://data.foli.fi/citybike")
      .then((response) => response.json())
      .then((data) => {
        Object.keys(data.racks).forEach((key, index) => {
          var bikeIcon = L.divIcon({
            className: "bike-icon",

            iconAnchor: [12, 12],
            html:
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px"><path d="M0 0h24v24H0z" fill="none"/><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>',
          });

          foliBikeRacks[index] = L.marker(
            [data.racks[key].lat, data.racks[key].lon],
            { icon: bikeIcon }
          ).bindPopup(data.racks[key].name);
        });
      })
      .then(() => {
        var bikeRacksLayer = L.layerGroup(foliBikeRacks).addTo(map);

        console.log(map.hasLayer(bikeRacksLayer));
        //console.log(foliBikeRacks);
        var bikeRacksControl = {
          "Bike racks": bikeRacksLayer,
        };
        L.control.layers(null, bikeRacksControl).addTo(map);
      });
  }, []);

  useEffect(() => {
    // map = L.map("mapid").setView(
    //   [startPosition[0], startPosition[1]],
    //   startZoomLevel
    // );
    // var bikeRacks = {
    //   "Bike racks": foliBikeRacks,
    // };

    map = L.map("mapid", {
      center: [startPosition[0], startPosition[1]],
      zoom: 10,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    }).addTo(map);
  }, []);

  return (
    <div className="App">
      {/* <Map center={position} zoom={13}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </Map> */}

      <div id="mapid">
        {}
        {/* {foliBusStops &&
          Object.keys(foliBusStops).forEach((key) => {
            //console.log(foliBusStops[key]);
            L.marker([
              foliBusStops[key].stop_lat,
              foliBusStops[key].stop_lon,
            ]).addTo(map);
          })} */}
      </div>
    </div>
  );
}

export default App;
