import { LayerGroup, LayersControl, TileLayer } from "react-leaflet";
import ProjectionSelector from "../projectionSelector/ProjectionSelector";
import CustomDataLayer from "../layers/custom-data-layer";
import { useAuthContext } from "../../auth/hooks/use-auth-context";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const { BaseLayer, Overlay } = LayersControl;

export default function MapHeader({
  onSetProjection,
  selectedProjection,
  onSetOpen,
  searchTrigger,
}) {


  const {logout} = useAuthContext();

  const nanvigate = useNavigate();


  const handleLogout = useCallback(() => {
    logout()
    nanvigate("/")
  }, [])

  return (
    <>
     

      {/* Layers */}
      <LayersControl position="topright">
        <BaseLayer checked name="Hybride">
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
            maxZoom={22}
          />
        </BaseLayer>
        <BaseLayer name="Carte Standard">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            maxZoom={22}
          />
        </BaseLayer>
        <BaseLayer name="Satellite">
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
            maxZoom={22}
          />
        </BaseLayer>

        <Overlay checked name="Titres Foncier">
          <LayerGroup>
            <CustomDataLayer searchTitre={searchTrigger} />
          </LayerGroup>
        </Overlay>
      </LayersControl>
      {/* Layers */}

      {/* Selector prijection */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1500,
        display: "flex",
        gap: 12
      }}>
        <button className="advanced-search-button" style={{
          whiteSpace: "nowrap"
        }} onClick={() => onSetOpen(true)}>
          Rechercher un titre foncier
        </button>
        <ProjectionSelector
          onChangeProjection={(value) => onSetProjection(value)}
          selectedProjection={selectedProjection}
        />

      </div>
      <div style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "20px",
            zIndex: 1500,
           
        }}>
            <button className="logout-button" style={{
                  whiteSpace: "nowrap",
                   backgroundColor: "#3c7ea9 !important"
                }} onClick={handleLogout}>
                Se Déconecter
              </button>
        </div>
      {/* Selector prijection */}
    </>
  );
}