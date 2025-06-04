// pages/EditorPage.jsx
"use client";
import React, { useRef, useState, useEffect } from "react";
import { YMaps, Map } from "react-yandex-maps";
import domtoimage from "dom-to-image";
import s from './page.module.css'

const signs = [
  { id: "stop", label: "Стоп", emoji: "🛑" },
  { id: "detour", label: "Объезд", emoji: "↩️" },
  { id: "roadwork", label: "Работы", emoji: "🚧" },
];

const EditorPage = () => {
  const [mode, setMode] = useState("map");
  const [center, setCenter] = useState([55.75363, 37.62007]);
  const [zoom, setZoom] = useState(10);
  const [staticUrl, setStaticUrl] = useState(null);
  const [elements, setElements] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const mapRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMapChange = (e) => {
    const map = e.get("target");
    setCenter(map.getCenter());
    setZoom(map.getZoom());
  };

  const confirmArea = () => {
    const url = `https://static-maps.yandex.ru/1.x/?ll=${center[1]},${center[0]}&z=${zoom}&l=map&size=650,450`;
    setStaticUrl(url);
    setMode("editor");
  };

  const handleAddSign = (sign) => {
    setElements([...elements, { ...sign, x: 100, y: 100 }]);
  };

  const handleMouseDown = (index) => setDraggingIndex(index);
  const handleMouseUp = () => setDraggingIndex(null);
  const handleMouseMove = (e) => {
    if (draggingIndex !== null) {
      const mapRect = mapRef.current.getBoundingClientRect();
      const updated = [...elements];
      updated[draggingIndex].x = e.clientX - mapRect.left - 20;
      updated[draggingIndex].y = e.clientY - mapRect.top - 20;
      setElements(updated);
    }
  };

  const handleExportImage = () => {
    if (mapRef.current && imageLoaded) {
      domtoimage.toPng(mapRef.current)
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = `static-map.png`;
            link.href = dataUrl;
            link.click();
          })
          .catch((err) => {
            console.error("Ошибка экспорта:", err);
          });
    }
  };

  return (
      <div style={{ width: "100vw", height: "100vh", padding: 0, margin: 0 }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: 10,
        }}>
          {mode === "map" ? (
              <>
                <h2>Выберите участок карты</h2>
                <div className={s.costyl} style={{ width: "85vw", height: "85vh" }}>
                  <Map
                      defaultState={{ center, zoom }}
                      width="100%"
                      height="100%"
                      onBoundsChange={handleMapChange}
                  />
                </div>
                <button onClick={confirmArea}>Использовать эту область</button>
              </>
          ) : null}

          {mode === "editor" && (
              <>
                <h2>Редактор схемы</h2>
                <div style={{ marginBottom: 10 }}>
                  {signs.map((sign) => (
                      <button
                          key={sign.id}
                          onClick={() => handleAddSign(sign)}
                          style={{ marginRight: 10 }}
                      >
                        {sign.emoji} {sign.label}
                      </button>
                  ))}
                  <button onClick={handleExportImage}>Сохранить в PNG</button>
                </div>
                <div
                    ref={mapRef}
                    style={{
                      width: "85vw",
                      height: "85vh",
                      position: "relative",
                      border: "1px solid #ccc",
                      overflow: "hidden",
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                  <img
                      ref={imageRef}
                      src={staticUrl}
                      alt="map"
                      onLoad={() => setImageLoaded(true)}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: 0,
                      }}
                  />
                  {elements.map((el, index) => (
                      <div
                          key={index}
                          onMouseDown={() => handleMouseDown(index)}
                          style={{
                            position: "absolute",
                            left: el.x,
                            top: el.y,
                            padding: 8,
                            background: "white",
                            border: "1px solid #ccc",
                            borderRadius: 8,
                            cursor: "move",
                            userSelect: "none",
                            zIndex: 1,
                          }}
                      >
                        {el.emoji}
                      </div>
                  ))}
                </div>
              </>
          )}
        </div>
      </div>
  );
};

export default EditorPage;
