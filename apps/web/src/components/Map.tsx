import React, { useEffect, useState } from 'react';
import { MapOptions } from '@maptiler/sdk';
import * as maptilersdk from '@maptiler/sdk';
import { GeocodingControl } from "@maptiler/geocoding-control/react";
import '@maptiler/sdk/dist/maptiler-sdk.css';
import "@maptiler/geocoding-control/style.css";
import type { MapController } from "@maptiler/geocoding-control/types";
import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import maplibregl from "maplibre-gl";
import { toast } from 'sonner';
import { LanguageString } from '@maptiler/sdk'; 

export default function Map({ setCurrentCity, setCurrentProvince, setLngLat, setCurrentSubDistrict, setCurrentAddress, setCurrentWard, setCurrentNeighbor, setCurrentRoad }: { setCurrentCity:React.Dispatch<React.SetStateAction<string>>, setCurrentProvince: React.Dispatch<React.SetStateAction<string>>, setCurrentSubDistrict:any, setCurrentNeighbor:any, setCurrentAddress:any, setCurrentWard: any, setCurrentRoad:any, setLngLat:any }) {
    const [API_KEY] = useState('PMHbm8JtLTjhbqfZCtwb');
    const [mapController, setMapController] = useState<MapController>();

    useEffect(() => {
        maptilersdk.config.apiKey = API_KEY;
        maptilersdk.config.primaryLanguage = maptilersdk.Language.INDONESIAN;
        const options : MapOptions = {
            container: document.getElementById("map") as HTMLElement,
            style: maptilersdk.MapStyle.STREETS,
            geolocate: maptilersdk.GeolocationType.POINT,
            fullscreenControl: 'bottom-right',
            language: 'name:id'
        }
        const map = new maptilersdk.Map(options);
        const marker = new maptilersdk.Marker({ color: '#ff0000' }).setLngLat([0, 0]).addTo(map);
        
        setMapController(createMapLibreGlMapController(map, maplibregl));

        map.on('load', () => {
            map.addSource('search-results', {
                type: 'geojson',
                data: {
                    "type": "FeatureCollection",
                    "features": []
                }
            });
            map.addLayer({
                'id': 'point-result',
                'type': 'circle',
                'source': 'search-results',
                'paint': {
                    'circle-radius': 8,
                    'circle-color': '#B42222',
                    'circle-opacity': 0.5
                },
                'filter': ['==', '$type', 'Point']
            });
        });

        map.on('click', async (e) => {
            map.setLanguage(maptilersdk.Language.INDONESIAN);
            const { lng, lat } = e.lngLat;
            marker.setLngLat([lng, lat])
            const results = await maptilersdk.geocoding.reverse([lng, lat]);
            if (results.features) {
                const countryId = results.features.filter(item => item.place_type_name[0] == 'country')[0].id
                const placeName = results.features.filter(item => item.place_type_name[0] == 'country')[0].place_name
                if (countryId == 'country.124' || placeName == 'Indonesia') {
                    const province = results.features.filter(item => item.place_type_name[0] == 'province')[0].text

                    const provinceMapping: { [key: string]: string } = {
                        'Special Region of Yogyakarta': 'DI Yogyakarta',
                        'Special Capital Region of Jakarta': 'DKI Jakarta',
                        'Bali': 'Bali',
                        'Bangka Belitung Islands': 'Bangka Belitung',
                        'Aceh': 'Nanggroe Aceh Darussalam (NAD)',
                        'West Nusa Tenggara': 'Nusa Tenggara Barat (NTB)',
                        'East Nusa Tenggara': 'Nusa Tenggara Timur (NTT)',
                        'North Sumatra': 'Sumatera Utara',
                        'South Sumatra': 'Sumatera Selatan',
                        'West Sumatra': 'Sumatera Barat',
                        'South Papua': 'Papua',
                        'Central Papua': 'Papua',
                        'Highlands Papua': 'Papua',
                        'West Java': 'Jawa Barat',
                        'Central Java': 'Jawa Tengah',
                        'East Java': 'Jawa Timur',
                        'Banten': 'Banten',
                        'West Kalimantan': 'Kalimantan Barat',
                        'Central Kalimantan': 'Kalimantan Tengah',
                        'South Kalimantan': 'Kalimantan Selatan',
                        'East Kalimantan': 'Kalimantan Timur',
                        'North Kalimantan': 'Kalimantan Utara',
                        'North Sulawesi': 'Sulawesi Utara',
                        'Central Sulawesi': 'Sulawesi Tengah',
                        'South Sulawesi': 'Sulawesi Selatan',
                        'Southeast Sulawesi': 'Sulawesi Tenggara',
                        'Gorontalo': 'Gorontalo',
                        'West Sulawesi': 'Sulawesi Barat',
                        'Maluku': 'Maluku',
                        'North Maluku': 'Maluku Utara',
                        'West Papua': 'Papua Barat',
                        'Papua': 'Papua'
                    };

                    const city = results.features.filter(item => item.place_type_name[0] == 'regency')[0]

                    let typeArr = []
                    for (let type of results.features) {
                        if ((type.place_type_name[0] == 'country' || type.place_type_name[0] == 'province') || type.place_type_name[0] == 'regency') {
                            continue
                        } else {
                            typeArr.push(type.place_type_name[0])
                        }
                    }
                    if (typeArr) {
                        if (typeArr.includes('sub-district')) {
                            const subDistrict = results.features.filter(item => item.place_type_name[0] == "sub-district")[0];
                            setCurrentSubDistrict(subDistrict)
                        } else {
                            setCurrentSubDistrict()
                        }
                        
                        if (typeArr.includes('neighborhood association')) {
                            const neighbor = results.features.filter(item => item.place_type_name[0] == "neighborhood association")[0];
                            setCurrentNeighbor(neighbor)
                        } else {
                            setCurrentNeighbor()
                        }

                        if (typeArr.includes('ward')) {
                            const ward = results.features.filter(item => item.place_type_name[0] == "ward")[0];
                            setCurrentWard(ward)
                        } else {
                            setCurrentWard()
                        }
                        
                        if (typeArr.includes('road')) {
                            const road = results.features.filter(item => item.place_type_name[0] == "road")[0];
                            setCurrentRoad(road)
                        } else {
                            setCurrentRoad()
                        }

                        if (typeArr.includes('address')) {
                            const address = results.features.filter(item => item.place_type_name[0] == 'address')[0].place_name_id || results.features.filter(item => item.place_type_name[0] == 'address')[0].place_name;
                            setCurrentAddress(address)
                        } else {
                            setCurrentAddress()
                        }
                    } else {
                        setCurrentSubDistrict(); setCurrentNeighbor(); setCurrentNeighbor()
                        setCurrentWard(); setCurrentRoad(); setCurrentAddress('')
                    }

                    let parsed = ''
                    let parsedBackupCity = ''
                    if (city && typeof city.text === 'string') {
                        if (city.text.includes('Kabupaten')) {
                            parsed = city.text.split('Kabupaten')[1].trim() || city.text.split('Kabupaten')[1].trim();
                        } else if (city.text.includes('Kota')) {
                            parsed = city.text.split('Kota')[1].trim() || city.text.split('Kota')[1].trim()
                        } else if (city.text.includes('City')) {
                            parsed = city.text.split('City of ')[1].trim()
                        }
                    } else if (typeArr.length > 0) {
                        // toast('typeArr must be exist', { description: typeArr[0] });
                        const backup = results.features.filter(item => item.place_type_name[0] == typeArr[typeArr.length - 1])[0];
                        if (backup && backup.text && typeof backup.text == 'string') {
                            if (backup.text.includes('Kabupaten')) {
                                parsedBackupCity = backup.text.split('Kabupaten')[1].trim();
                            } else if (backup.text.includes('Kota')) {
                                parsedBackupCity = backup.text.split('Kota')[1].trim();
                            } else if (backup.text.includes('City')) {
                                parsedBackupCity = backup.text.split('City of ')[1].trim();
                            } else if (backup.text.includes('Denpasar')) {
                                parsedBackupCity = 'Denpasar'
                            } else {
                                parsedBackupCity = backup.text;
                            }
                        }
                        // setTimeout(() => {
                        //     toast('Back up city', { description: parsedBackupCity })
                        // }, 1000);
                    }

                    const cityMapping: { [key: string]: string } = {
                        "Labuhanbatu": "Labuhan Batu",
                        "Labuhanbatu Selatan": "Labuhan Batu Selatan",
                        "Labuhanbatu Utara": "Labuhan Batu Utara",
                    };
                    
                    const newCity = cityMapping[city?.text] || parsed || city?.text || city?.text || parsedBackupCity || "";
                    setCurrentCity(newCity);
                    setCurrentProvince(provinceMapping[province] || province);
                    setLngLat([lng, lat])
                } else {
                    toast.error('Not within reach', { description: 'please choose Indonesian Region' })
                }

            }
        });

    }, []);

    return (
        <>
            <div id='map' className="w-full h-64 rounded-md" >
                <div className='absolute top-2 left-2'>
                    <GeocodingControl apiKey={API_KEY} mapController={mapController} />
                </div>
            </div>
            <div id="results">
                <ul id="search-results">
                </ul>
            </div>
        </>
    );
}
