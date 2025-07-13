


import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import { INITIAL_CENTER, INITIALZOOM } from "../../utils/contant";
import MapHeader from "../../components/map/map-header";
import { useState, useRef, useEffect } from "react";
import SearchLocation from "../../components/search/SearchLocation";
import ZoomInitialControl from "../../components/ZoomInitialControl";
import UserLocation from "../../components/UserLocation";
import FileImport from "../../components/fileImport/FileImport";
import SelectionTable from "../../components/selectionTable/SelectionTable";
import DrawingTools from "../../components/drawingTools/DrawingTools";
import L from "leaflet";
import RechercheAvancee from "../../components/modal/RechercheAvancee";
import "../../config/proj-config";
import { iconMap } from "../../config/icon-config";
import SearchPoint from "../../components/search/SearchPoint";
import ClusterLayer from './ClusterLayer';
import Deplacement from "./Deplacement";

const FitToImportedLayers = ({ layers }) => {
  const map = useMap();

  useEffect(() => {
    const visibleLayers = layers.filter(
      (layer) => layer.visible && layer.data?.features?.length > 0
    );
    if (visibleLayers.length === 0) return;

    const allBounds = visibleLayers.reduce((acc, layer) => {
      const geojsonLayer = L.geoJSON(layer.data);
      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) {
        acc.push(bounds);
      }
      return acc;
    }, []);

    if (allBounds.length > 0) {
      const combinedBounds = allBounds.reduce(
        (acc, bounds) => acc.extend(bounds),
        allBounds[0]
      );
      map.fitBounds(combinedBounds, { padding: [30, 30] });
    }
  }, [layers, map]);

  return null;
};

export default function MapPage() {
  const [selectedProjection, setSelectedProjection] = useState("EPSG:26192");
  const [searchTitre, setSearchTitre] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");
  const [importedLayers, setImportedLayers] = useState([]);
  const [rechercheResult, setRechercheResult] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const mapRef = useRef(null);
  const [savedFiles, setSavedFiles] = useState([]);
  const [showSavedFiles, setShowSavedFiles] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);
  const [originalLayers, setOriginalLayers] = useState([]);



  const handleSearch = () => {
    setSearchTrigger(searchTitre);
    setSearchTitre("");
    setRechercheResult(null);
  };
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleRechercheAvancee = async (criteres) => {
    try {
      const params = new URLSearchParams(criteres).toString();
      const res = await fetch(`${apiUrl}/api/recherche-fonciere?${params}`);
      const data = await res.json();
      let resultData = data;

      if (data?.feature && !data.features) {
        resultData = { type: "FeatureCollection", features: [data.feature] };
      }

      if (resultData?.features?.length > 0) {
        const props = resultData.features[0].properties;
        if (props?.nvtitre) setSearchTrigger(props.nvtitre);
        setRechercheResult(resultData);
      } else {
        alert("❌ Aucun résultat trouvé");
        setRechercheResult(null);
      }
    } catch (error) {
      console.error("Erreur recherche avancée :", error);
    }
  };

  useEffect(() => {
    if (rechercheResult && mapRef.current) {
      const layer = L.geoJSON(rechercheResult);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [rechercheResult]);

  const handleFileLoad = (geojson) => {
  const layerId = Date.now().toString();
  const layerName = geojson.name || geojson?.features?.[0]?.properties?.name || `Couche ${importedLayers.length + 1}`;

  const newLayer = { id: layerId, name: layerName, data: geojson, visible: true };

  setImportedLayers((prev) => [...prev, newLayer]);
  setOriginalLayers((prev) => [...prev, newLayer]); // ✅ copie originale
  setRechercheResult(null);
};


  const toggleLayerVisibility = (id) => {
    setImportedLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const deleteLayer = (id) => {
    setImportedLayers((prev) => prev.filter((layer) => layer.id !== id));
  };

  const fetchSavedFiles = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/geojson/liste-fichiers`);

      const data = await res.json();
      setSavedFiles(data);
      setShowSavedFiles(true);
    } catch (err) {
      console.error("Erreur récupération fichiers sauvegardés :", err);
    }
  }; 

  const controlPanelStyle = {
    position: "absolute",
    top: 700,
    right: 10,
    background: "white",
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    fontSize: "14px",
  };

  return (
    <>
      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIALZOOM}
        style={{ height: "100vh", width: "100%", position: "relative", zIndex: 0 }}
        maxZoom={22}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapHeader
          onSetProjection={setSelectedProjection}
          selectedProjection={selectedProjection}
          title={searchTitre}
          onSetTitle={setSearchTitre}
          onSearch={handleSearch}
          onSetOpen={setOpenSearch}
          searchTrigger={searchTrigger}
        />
        <DrawingTools selectedProjection={selectedProjection} />
        <SearchLocation />
        <ZoomInitialControl initialCenter={INITIAL_CENTER} initialZoom={INITIALZOOM} />
        <UserLocation />
        <FileImport onFileLoad={handleFileLoad} selectedProjection={selectedProjection} />
        <SearchPoint selectedProjection={selectedProjection} />
        <ClusterLayer />
        <FitToImportedLayers layers={importedLayers} />

        {importedLayers
          .filter((layer) => layer.visible && layer.data?.features?.length > 0)
          .flatMap((layer) =>
            layer.data.features.flatMap((feature, idx) => {
             if (!feature || !feature.geometry) return []; // protection
            const { geometry, properties } = feature;

              if (geometry.type === "Point") {
                const [lng, lat] = geometry.coordinates;
                return (
                  <Marker key={`${layer.id}-pt-${idx}`} position={[lat, lng]} icon={iconMap}>
                    <Popup><pre>{JSON.stringify(properties, null, 2)}</pre></Popup>
                  </Marker>
                );
              }

              if (geometry.type === "MultiPoint") {
                return geometry.coordinates.map((coord, i) => {
                  const [lng, lat] = coord;
                  return (
                    <Marker key={`${layer.id}-mp-${idx}-${i}`} position={[lat, lng]}>
                      <Popup><pre>{JSON.stringify(properties, null, 2)}</pre></Popup>
                    </Marker>
                  );
                });
              }

              return (
                <GeoJSON
                  key={`${layer.id}-geo-${idx}`}
                  data={feature}
                  style={{ color: "blue", weight: 2, opacity: 0.8, fillOpacity: 0.2 }}
                  onEachFeature={(feat, lyr) => {
                    lyr.bindPopup(`<pre>${JSON.stringify(feat.properties, null, 2)}</pre>`);
                  }}
                />
              );
            })
          )}

        {!rechercheResult && <SelectionTable selectedProjection={selectedProjection} />}

        {rechercheResult?.features?.length > 0 && (
          <GeoJSON
            data={rechercheResult}
            style={{ color: "green" }}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(`<pre>${JSON.stringify(feature.properties, null, 2)}</pre>`);
            }}
          />
        )}
        {/* Déplacement : seulement pour les couches visibles et activé */}
        {isDraggable &&
          importedLayers
            .filter((layer) => layer.visible && layer.data)
            .map((layer) => (
              <Deplacement
                key={`deplacement-${layer.id}`}
                data={layer.data}
                isDraggable={true}
                onGeometriesUpdated={(updatedGeojson) => {
                  setImportedLayers((prev) =>
                    prev.map((l) =>
                      l.id === layer.id ? { ...l, data: updatedGeojson } : l
                    )
                  );
                }}
              />
            ))}
      </MapContainer>

      {/* Table des couches importées */}
      {importedLayers.length > 0 && (
        <div style={controlPanelStyle}>
          <strong>📂 Couches importées</strong>
          {importedLayers.map((layer) => (
            <div key={layer.id} style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => toggleLayerVisibility(layer.id)}
                style={{ marginRight: 6 }}
              />
              <span style={{ flexGrow: 1 }}>{layer.name}</span>
              <button
                onClick={() => {
                  const newName = prompt("Nouveau nom de la couche :", layer.name);
                  if (newName) {
                    setImportedLayers((prev) =>
                      prev.map((l) =>
                        l.id === layer.id ? { ...l, name: newName } : l
                      )
                    );
                  }
                }}
                style={{ marginLeft: 6, background: "#2196f3", color: "white", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}
              >✏️</button>
              <button
                onClick={() => deleteLayer(layer.id)}
                style={{ marginLeft: 6, background: "#f44336", color: "white", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}
              >❌</button>
              <button
                onClick={() => setIsDraggable((prev) => !prev)}
                style={{ marginLeft: 6, background: isDraggable ? "#e67e22" : "#16a085", color: "white", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}
              >🚚</button>
            </div>
          ))}

          <div style={{ marginTop: 10 }}>
          <button
  onClick={async () => {
    try {
      const original = originalLayers[0]; //  on récupère la copie originale intacte

      if (!original || !original.data?.features?.length) {
        alert("❌ Aucun fichier à enregistrer.");
        return;
      }

      const originalFeatures = original.data.features;
      const updatedFeatures = updatedData?.features || [];

      // On remplace les entités modifiées dans le fichier original
      const updatedById = new Map(
        updatedFeatures.map((f) => [f.id || f.properties?.id, f])
      );

      const finalFeatures = originalFeatures.map((feat) => {
        const fid = feat.id || feat.properties?.id;
        return updatedById.has(fid) ? updatedById.get(fid) : feat;
      });

      const finalGeojson = {
        type: "FeatureCollection",
        name: `${original.name}_déplacé`,
        features: finalFeatures.map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            name: `${original.name}_déplacé`,
          },
        })),
      };
      await fetch(`${apiUrl}/api/geojson/enregistrer-ou-mettreajour-geojson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geojson: finalGeojson }),
      });

      alert("✅ Le fichier est bien enregistré !");
    } catch (err) {
      console.error("❌ Erreur d'enregistrement :", err);
      alert("❌ Erreur serveur");
    }
  }}
  style={{
    background: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: 4,
    padding: "6px 10px",
    cursor: "pointer",
    width: "100%",
  }}
>
  💾 Enregistrer dans la base 
</button>

<button
  onClick={() => {
    setImportedLayers(originalLayers);
    setUpdatedData(null); // Annule les modifications locales 
    alert("✅ Déplacements annulés, données restaurées.");
  }}
  style={{
    marginTop: 6,
    background: "#9e9e9e",
    color: "white",
    border: "none",
    borderRadius: 4,
    padding: "6px 10px",
    cursor: "pointer",
    width: "100%",
  }}
>
  🔁 Annuler les déplacements
</button>
            <button
              onClick={fetchSavedFiles}
              style={{ marginTop: 6, background: "#1976d2", color: "white", border: "none", borderRadius: 4, padding: "6px 10px", cursor: "pointer", width: "100%" }}
            >📥 Charger depuis la base</button>
          </div>
        </div>
      )}

      {/* Liste des fichiers enregistrés */}
      {showSavedFiles && (
  <div style={{
    position: "absolute",
    top: '50%', left: '50%', transform: "translate(-50%, -50%)",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 10,
    zIndex: 1000,
    width: "600px",
    overflowY: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
  }}>
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center"
    }}>
      <strong>📁 Fichiers sauvegardés :</strong>
      <button
        onClick={() => setShowSavedFiles(false)}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
          color: "#888"
        }}
        title="Fermer"
      >❌</button>
    </div>

    <table style={{ width: "100%", fontSize: 14, marginTop: 10 }}>
      <thead>
        <tr><th style={{ textAlign: "left" }}>Nom</th><th>Action</th></tr>
      </thead>
      <tbody>
        {savedFiles.map((file) => (
          <tr key={file.id}>
            <td>{file.file_name}</td>
            <td>
              <button
                onClick={async () => {
                  const res = await fetch(`${apiUrl}/api/geojson/liste-fichiers/${file.id}`);
                  const geojson = await res.json();
                  handleFileLoad(geojson);
                  setShowSavedFiles(false);
                }}
                style={{
                  backgroundColor: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  padding: "2px 6px",
                  cursor: "pointer"
                }}
              >Charger</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      <RechercheAvancee
        onSearch={handleRechercheAvancee}
        isOpen={openSearch}
        onClose={() => setOpenSearch(false)}
      />
    </>
  );
}
