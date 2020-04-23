import React, { useState } from "react";

const MapController = ({ map, controller }) => {
  const [state, setState] = useState(map.hasLayer(controller.layer));

  return (
    <div
      className="Menu-controller-item"
      onClick={() => {
        map.hasLayer(controller.layer)
          ? controller.layer.remove()
          : controller.layer.addTo(map);
        setState(map.hasLayer(controller.layer));
      }}
    >
      <input
        type="checkbox"
        className="Menu-controller-checkbox"
        checked={state}
      ></input>
      <div className="Menu-controller-name">{controller.name}</div>
    </div>
  );
};

export default MapController;
