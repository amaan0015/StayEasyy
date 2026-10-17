import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

function PropertyMap({ latitude, longitude, title }) {
  if (!latitude || !longitude) {
    return (
      <div className="rounded-xl bg-slate-100 p-6 text-center text-slate-500">
        Location not available
      </div>
    );
  }

  const position = [latitude, longitude];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="h-[400px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>
            <strong>{title}</strong>
            <br />
            Property location
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default PropertyMap;