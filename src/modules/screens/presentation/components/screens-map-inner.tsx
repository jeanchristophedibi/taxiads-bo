'use client';

import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { useMemo } from 'react';
import type { ScreenMapItem } from '../../domain/entities/screen';

interface Props {
  items: ScreenMapItem[];
}

const STATUS_COLOR: Record<string, string> = {
  online: '#34C759',
  offline: '#FF3B30',
  uninitialized: '#FF9500',
  restarting: '#007AFF',
};

const DEFAULT_CENTER: [number, number] = [5.3599, -4.0083];

const isValidCoord = (item: ScreenMapItem): item is ScreenMapItem & { coordinates: { lat: number; lng: number; source: string } } => {
  return !!item.coordinates && Number.isFinite(item.coordinates.lat) && Number.isFinite(item.coordinates.lng);
};

export function ScreensMapInner({ items }: Props) {
  const points = useMemo(() => items.filter(isValidCoord), [items]);

  const center = useMemo<[number, number]>(() => {
    if (!points.length) return DEFAULT_CENTER;
    const lat = points.reduce((acc, item) => acc + item.coordinates.lat, 0) / points.length;
    const lng = points.reduce((acc, item) => acc + item.coordinates.lng, 0) / points.length;
    return [lat, lng];
  }, [points]);

  return (
    <div className="h-[65vh] min-h-[420px] w-full rounded-xl overflow-hidden border border-slate-200">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full" attributionControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((item) => {
          const color = STATUS_COLOR[item.status] ?? '#8E8E93';
          return (
            <CircleMarker
              key={item.key}
              center={[item.coordinates.lat, item.coordinates.lng]}
              radius={8}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
            >
              <Popup>
                <div className="text-xs space-y-1.5 min-w-44">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p><span className="text-slate-500">Code:</span> {item.screenCode}</p>
                  <p><span className="text-slate-500">Statut:</span> {item.status}</p>
                  <p><span className="text-slate-500">En ligne:</span> {item.isLive ? 'Oui' : 'Non'}</p>
                  <p><span className="text-slate-500">Batterie:</span> {item.battery ?? '—'}%</p>
                  <p><span className="text-slate-500">Réseau:</span> {item.networkType ?? '—'}</p>
                  <p><span className="text-slate-500">Playlist:</span> {item.playlist?.value ?? '—'}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
