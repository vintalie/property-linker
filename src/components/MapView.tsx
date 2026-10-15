import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

export default function MapView({
  markers,
  selected,
  onSelect,
}: {
  markers: MarkerData[];
  selected?: string | null;
  onSelect?: (id: string) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { zoomControl: true }).setView([-23.96, -46.33], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue("--primary").trim();
    const accent = styles.getPropertyValue("--accent").trim();
    layer.current.clearLayers();
    markers.forEach((m) => {
      const active = m.id === selected;
      L.circleMarker([m.lat, m.lng], {
        radius: active ? 12 : 9,
        color: primary,
        weight: 3,
        fillColor: active ? primary : accent,
        fillOpacity: 0.95,
      })
        .bindTooltip(m.label, { direction: "top", offset: [0, -8] })
        .on("click", () => onSelect?.(m.id))
        .addTo(layer.current!);
    });
    if (markers.length) {
      map.current.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng])), {
        padding: [48, 48],
        maxZoom: 16,
      });
    }
  }, [markers, selected, onSelect]);

  return <div ref={el} className="h-full w-full" />;
}
