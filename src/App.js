import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import L from "leaflet";
import MapController from "./MapController";
import leafletIcons from "./leafletIcons.js";

function App() {
  const map = useRef();

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [controllers, setControllers] = useState({});
  const startZoomLevel = 10;
  const startPosition = [60.45451, 22.264824];

  const foliBusLocations = {};
  const foliBikeRacks = [];
  const turkuRegionWeatherStations = [];

  const addController = (controller) => {
    setControllers((controllers) => {
      if (controllers.hasOwnProperty(controller.area)) {
        return {
          ...controllers,
          [controller.area]: [
            ...controllers[controller.area],
            { ...controller },
          ],
        };
      } else {
        return {
          ...controllers,
          turku: [{ ...controller }],
        };
      }
    });
  };

  useEffect(() => {
    const initFoliBusLocations = () => {
      fetch("https://data.foli.fi/siri/vm")
        .then((response) => response.json())
        .then((data) => {
          Object.keys(data.result.vehicles).forEach((key, index) => {
            if (data.result.vehicles[key].monitored === true) {
              foliBusLocations[key] = L.marker(
                [
                  data.result.vehicles[key].latitude,
                  data.result.vehicles[key].longitude,
                ],
                { icon: leafletIcons.busIcon }
              ).bindPopup(data.result.vehicles[key].publishedlinename);
            }
          });
        })
        .then(() => {
          var busLocationsLayer = L.layerGroup(Object.values(foliBusLocations));

          var newController = {
            area: "turku",
            name: "Bus locations",
            layer: busLocationsLayer,
          };
          addController(newController);
        });
    };

    initFoliBusLocations();

    setInterval(() => {
      fetch("https://data.foli.fi/siri/vm")
        .then((response) => response.json())
        .then((data) => {
          Object.keys(data.result.vehicles).forEach((key, index) => {
            if (data.result.vehicles[key].monitored === true) {
              if (foliBusLocations.hasOwnProperty(key)) {
                foliBusLocations[key].setLatLng(
                  new L.LatLng(
                    data.result.vehicles[key].latitude,
                    data.result.vehicles[key].longitude
                  )
                );
              }
            }
          });
        });
    }, 3000);

    fetch("https://data.foli.fi/citybike")
      .then((response) => response.json())
      .then((data) => {
        Object.keys(data.racks).forEach((key, index) => {
          foliBikeRacks[index] = L.marker(
            [data.racks[key].lat, data.racks[key].lon],
            { icon: leafletIcons.bikeIcon }
          ).bindPopup(data.racks[key].name);
        });
      })
      .then(() => {
        var bikeRacksLayer = L.layerGroup(foliBikeRacks);

        var newController = {
          area: "turku",
          name: "Bike rack locations",
          layer: bikeRacksLayer,
        };
        addController(newController);
      });

    fetch("https://api.turku.fi/airmonitoring/v1/stations/")
      .then((response) => response.json())
      .then((data) => {
        data.hasOwnProperty("features") &&
          data.features.forEach((feature, index) => {
            turkuRegionWeatherStations[index] = L.marker(
              [
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
              ],
              { icon: leafletIcons.weatherStationIcon }
            ).bindPopup(
              `<div className="Marker-popup><div className="Marker-popup-title><h2>${feature.properties.name}</h2></div><div className="Marker-popup-details"><h4>no2 : ${feature.properties.no2}</h4><h4>o3 : ${feature.properties.o3}</h4><h4>pm2 : ${feature.properties.pm2}</h4><h4>pm10 : ${feature.properties.pm10}</h4><h4>so2 : ${feature.properties.so2}</h4></div></div>`
            );
          });
      })
      .then(() => {
        var turkuRegionWeatherStationsLayer = L.layerGroup(
          turkuRegionWeatherStations
        );

        var newController = {
          area: "turku",
          name: "Weather stations",
          layer: turkuRegionWeatherStationsLayer,
        };
        addController(newController);
      });
  }, []);

  useEffect(() => {
    map.current = L.map("mapid", {
      center: [startPosition[0], startPosition[1]],
      zoom: startZoomLevel,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    }).addTo(map.current);
  }, []);

  return (
    <div className="App">
      <button
        className="Menu-button"
        style={{
          transform: `${
            !isMenuOpen ? "translateX(0px)" : "translateX(-200px)"
          }`,
        }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="black"
          width="24px"
          height="24px"
          style={{
            transform: `${isMenuOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
          }}
        >
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
          <path d="M0 0h24v24H0V0z" fill="none" />
        </svg>
      </button>
      <div
        className="Menu"
        id="Menu-controllers"
        style={{
          transform: `${isMenuOpen ? "translateX(0%)" : "translateX(100%)"}`,
        }}
      >
        {Object.keys(controllers).map((area) => {
          return (
            <div className="Menu-controller-group">
              <div className="Menu-controller-group-title">{area}</div>
              {controllers[area].map((controller) => {
                return (
                  <MapController map={map.current} controller={controller} />
                );
              })}
            </div>
          );
        })}
      </div>

      <div id="mapid"></div>
    </div>
  );
}

export default App;
