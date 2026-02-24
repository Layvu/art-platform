'use client';

import React, { useCallback, useEffect, useRef } from 'react';

import Script from 'next/script';

import type {
    CdekCourierAddress,
    CdekOfficeAddress,
    CDEKWidgetInstance,
    CdekWidgetProps,
} from '@/shared/types/cdek.interface';
import type { IOrderCdek } from '@/shared/types/order.interface';

const CONTAINER_ID = 'cdek-map-container';
const EKATERINBURG_COORDS: [number, number] = [60.597636, 56.837435];
const CDEK_PROXY_API_URL = '/api/cdek';
const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export const CdekWidget = ({ onChoose }: CdekWidgetProps) => {
    const widgetRef = useRef<CDEKWidgetInstance | null>(null);

    const initializeWidget = useCallback(() => {
        if (!window.CDEKWidget || !document.getElementById(CONTAINER_ID)) return;

        widgetRef.current?.destroy();
        widgetRef.current = new window.CDEKWidget({
            servicePath: CDEK_PROXY_API_URL,
            root: CONTAINER_ID,
            defaultLocation: EKATERINBURG_COORDS,
            apiKey: YANDEX_MAPS_API_KEY,

            onChoose: (mode, tariff, address) => {
                let selected: IOrderCdek;
                if (mode === 'office') {
                    const officeAddress = address as CdekOfficeAddress;
                    selected = {
                        type: 'pvz',
                        address: officeAddress.address,
                        code: officeAddress.code,
                    };
                } else {
                    // mode === 'door'
                    const courierAddress = address as CdekCourierAddress;
                    selected = {
                        type: 'courier',
                        address: courierAddress.formatted,
                    };
                }

                onChoose(selected);
            },
        });
    }, [onChoose]);

    useEffect(() => {
        if (window.CDEKWidget) {
            initializeWidget();
        }
        return () => widgetRef.current?.destroy();
    }, [initializeWidget]);

    return (
        <div className="relative w-full h-[400px] overflow-hidden rounded-md bg-gray-100">
            <Script
                src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3"
                strategy="afterInteractive"
                onLoad={initializeWidget}
            />
            <div id={CONTAINER_ID} className="absolute inset-0" />
        </div>
    );
};
