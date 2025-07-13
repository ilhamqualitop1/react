import { useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import proj4 from "proj4";
import "../../config/proj-config";

export default function SearchPoint({ selectedProjection }) {
  const [coordInput, setCoordInput] = useState("");
  const map = useMap();
  const [marker, setMarker] = useState(null);

  const isWGS84 = selectedProjection === "EPSG:4326";

  const handleSubmit = (e) => {
    e.preventDefault();

    const parts = coordInput.trim().split(";").map((p) => parseFloat(p.trim()));
    if (parts.length !== 2 || parts.some(isNaN)) {
      const msg = isWGS84
        ? "❌ Veuillez entrer deux coordonnées valides au format : latitude;longitude"
        : "❌ Veuillez entrer deux coordonnées valides au format : X;Y";
      alert(msg);
      return;
    }

    let lat, lng;

    try {
      if (isWGS84) {
        [lat, lng] = parts;
      } else {
        const [x, y] = parts;
        const [lon, latitude] = proj4(selectedProjection, "EPSG:4326", [x, y]);
        lat = latitude;
        lng = lon;
      }

      if (!lat || !lng) throw new Error("Coordonnées invalides");

      map.setView([lat, lng], 18);

      if (marker) marker.remove();

      const newMarker = L.marker([lat, lng]).addTo(map);
      newMarker
        .bindPopup(`📍 Point : ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .openPopup();
      setMarker(newMarker);
    } catch (err) {
      alert("❌ Erreur de conversion ou coordonnées invalides.");
      console.error(err);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right:300,
        zIndex: 1000,
        // backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "12px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        maxWidth: "300px",
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label style={{ fontWeight: "bold", marginBottom: 4 }}>
       
        </label>
        <input
          type="text"
          value={coordInput}
          onChange={(e) => setCoordInput(e.target.value)}
          placeholder={
            isWGS84 ? "Chercher:Lat ; long " : "Chercher : X ; Y "
          }
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: "6px",
            backgroundColor: "#2563eb",
            color: "white",
            // padding: "15px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
        🔎
        </button>
      </form>
    </div>
  );
}
