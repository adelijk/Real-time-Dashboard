import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const colors = ['red', 'blue', 'green', 'purple', 'orange' , 'black']; // Example color array

const MapChart = ({ data }) => {
  const defaultCenter = [0, 0];
  const defaultZoom = 2;

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '10px', borderRadius: '5px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <h4>Legend</h4>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ backgroundColor: colors[index % colors.length], width: 20, height: 20, borderRadius: '50%', marginRight: 10 }}></span>
            {item._id}
          </div>
        ))}
      </div>
      <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {data.map((item, index) => (
          item.lat && item.lng ? (
            <CircleMarker
              key={index}
              center={[item.lat, item.lng]}
              radius={Math.log(item.totalPrice + 1) * 5} // Scale radius based on totalPrice
              fillColor={colors[index % colors.length]} // Cycle through colors
              color={colors[index % colors.length]}
              fillOpacity={0.5}
            >
              <Popup>
                <strong>{item._id}</strong><br />
                Total Sales: {item.totalPrice.toFixed(2)}
              </Popup>
            </CircleMarker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
};

export default MapChart;
