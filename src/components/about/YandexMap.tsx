'use client';

import React from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const COORDS: [number, number] = [56.834102, 60.602352];

export default function YandexMap() {
    return (
        <YMaps>
            <Map defaultState={{ center: COORDS, zoom: 16 }} width="100%" height="100%">
                <Placemark geometry={COORDS} />
            </Map>
        </YMaps>
    );
}
