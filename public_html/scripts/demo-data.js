/**
 * AgroBridge Demo Data Module
 * @description Demo database for testing and demonstration
 * @version 4.0.0
 */

window.AgroBridgeDemoData = (function() {
    'use strict';

    var utils = window.AgroBridgeUtils;
    if (!utils) { console.warn('AgroBridgeUtils not loaded'); return {}; }

    // ==========================================
    // DEMO DATABASE
    // ==========================================
    var demoDatabase = {
        // ==========================================
        // AGUACATE HASS (4 entries)
        // ==========================================
        'AB-HASS-2026-001': {
            status: 'valid',
            product: 'Aguacate Hass Premium',
            variety: 'Hass',
            origin: 'Uruapan, Michoac\u00e1n, M\u00e9xico',
            region: 'Michoac\u00e1n',
            producer: 'Rancho El Aguacate Dorado',
            harvestDate: '2026-01-05',
            packingDate: '2026-01-05',
            exportDate: '2026-01-06',
            expiryDate: '2026-02-05',
            destination: 'Luxemburgo, UE',
            brix: '11.5\u00b0',
            ph: '6.2',
            avgTemp: '5.2\u00b0C',
            qualityScore: '9.8/10',
            blockchainHash: 'a7f3d2c1b8e9f4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
            timestamps: {
                harvest: '05 Ene 06:30',
                packing: '05 Ene 14:00',
                cold: '05 Ene 16:00',
                export: '06 Ene 08:00'
            },
            certifications: [
                { type: 'SENASICA', number: 'MEX-AV-789012', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-03-15', validUntil: '2026-03-15' },
                { type: 'APEAM', number: 'APEAM-2026-0892', issuer: 'APEAM Michoac\u00e1n', issuedDate: '2025-06-01', validUntil: '2026-06-01' },
                { type: 'GlobalGAP', number: '4050000891234', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-01-10', validUntil: '2026-01-10' }
            ],
            blockchain: {
                hash: 'a7f3d2c1b8e9f4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
                network: 'Polygon Amoy Testnet',
                blockNumber: 50234567,
                timestamp: 1736064600,
                txHash: '0x8a9b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'
            },
            gps: { latitude: 19.4181, longitude: -102.0528, elevation: '1620 msnm' },
            qualityMetrics: {
                dryMatter: '23.5%',
                weight: '245g',
                color: 'Verde oscuro',
                firmness: '\u00d3ptima',
                temperature: '5-7\u00b0C'
            },
            packaging: { type: 'Caja 4kg', lot: 'AB-HASS-2026-001', quantity: '160 kg', boxesCount: 40 },
            traceability: {
                field: 'Rancho El Aguacate Dorado',
                lot: 'Lote 15',
                block: 'Bloque A',
                packingHouse: 'Empacadora Valle Verde',
                coolingDate: '2026-01-05 16:00',
                dispatchDate: '2026-01-06 08:00'
            },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' },
                { type: 'Certificado de Calidad', url: '#', hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' }
            ]
        },
        'AB-HASS-2026-234': {
            status: 'valid',
            product: 'Aguacate Hass Org\u00e1nico',
            variety: 'Hass',
            origin: 'Tanc\u00edtaro, Michoac\u00e1n, M\u00e9xico',
            region: 'Michoac\u00e1n',
            producer: 'Cooperativa Oro Verde de Tanc\u00edtaro',
            harvestDate: '2026-01-03',
            packingDate: '2026-01-03',
            exportDate: '2026-01-04',
            expiryDate: '2026-02-03',
            destination: 'Dubai, EAU',
            brix: '12.0\u00b0',
            ph: '6.1',
            avgTemp: '5.5\u00b0C',
            qualityScore: '9.9/10',
            blockchainHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
            timestamps: { harvest: '03 Ene 05:45', packing: '03 Ene 12:00', cold: '03 Ene 14:30', export: '04 Ene 07:00' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-AV-890123', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-04-20', validUntil: '2026-04-20' },
                { type: 'USDA Organic', number: 'USDA-ORG-78234', issuer: 'USDA National Organic Program', issuedDate: '2025-02-15', validUntil: '2026-02-15' },
                { type: 'APEAM', number: 'APEAM-2026-1045', issuer: 'APEAM Michoac\u00e1n', issuedDate: '2025-07-01', validUntil: '2026-07-01' }
            ],
            blockchain: { hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', network: 'Polygon Amoy Testnet', blockNumber: 50198234, timestamp: 1735891500, txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c' },
            gps: { latitude: 19.3476, longitude: -102.3584, elevation: '2050 msnm' },
            qualityMetrics: { dryMatter: '24.8%', weight: '268g', color: 'Verde oscuro uniforme', firmness: 'Firme', temperature: '5-7\u00b0C' },
            packaging: { type: 'Caja 4kg', lot: 'AB-HASS-2026-234', quantity: '200 kg', boxesCount: 50 },
            traceability: { field: 'Huerta San Miguel', lot: 'Lote 8', block: 'Bloque C', packingHouse: 'Empacadora Tanc\u00edtaro Premium', coolingDate: '2026-01-03 14:30', dispatchDate: '2026-01-04 07:00' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef' },
                { type: 'Certificado Org\u00e1nico USDA', url: '#', hash: '0xcdef3456789012abcdef3456789012abcdef3456789012abcdef3456789012ab' }
            ]
        },
        'AB-HASS-2025-987': {
            status: 'valid', product: 'Aguacate Hass Export Grade', variety: 'Hass',
            origin: 'Perib\u00e1n, Michoac\u00e1n, M\u00e9xico', region: 'Michoac\u00e1n', producer: 'Agr\u00edcola Perib\u00e1n S.A. de C.V.',
            harvestDate: '2025-12-18', packingDate: '2025-12-18', exportDate: '2025-12-19', expiryDate: '2026-01-18',
            destination: 'Shanghai, China', brix: '11.8\u00b0', ph: '6.3', avgTemp: '5.0\u00b0C', qualityScore: '9.7/10',
            blockchainHash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
            timestamps: { harvest: '18 Dic 06:00', packing: '18 Dic 13:00', cold: '18 Dic 15:00', export: '19 Dic 06:30' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-AV-901234', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-05-10', validUntil: '2026-05-10' },
                { type: 'GlobalGAP', number: '4050000923456', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-03-01', validUntil: '2026-03-01' }
            ],
            blockchain: { hash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6', network: 'Polygon Amoy Testnet', blockNumber: 49876543, timestamp: 1734505200, txHash: '0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d' },
            gps: { latitude: 19.5123, longitude: -102.4287, elevation: '1890 msnm' },
            qualityMetrics: { dryMatter: '22.9%', weight: '232g', color: 'Verde oscuro', firmness: '\u00d3ptima', temperature: '5-7\u00b0C' },
            packaging: { type: 'Caja 4kg', lot: 'AB-HASS-2025-987', quantity: '240 kg', boxesCount: 60 },
            traceability: { field: 'Rancho Los Volcanes', lot: 'Lote 22', block: 'Bloque B', packingHouse: 'Empacadora Internacional Perib\u00e1n', coolingDate: '2025-12-18 15:00', dispatchDate: '2025-12-19 06:30' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef' },
                { type: 'Certificado de Calidad', url: '#', hash: '0xef5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcd' }
            ]
        },
        'AB-HASS-2026-456': {
            status: 'valid', product: 'Aguacate Hass Selecci\u00f3n', variety: 'Hass',
            origin: 'Ario de Rosales, Michoac\u00e1n, M\u00e9xico', region: 'Michoac\u00e1n', producer: 'Productores Unidos de Ario',
            harvestDate: '2026-01-06', packingDate: '2026-01-06', exportDate: '2026-01-07', expiryDate: '2026-02-06',
            destination: 'Tokyo, Jap\u00f3n', brix: '11.2\u00b0', ph: '6.0', avgTemp: '5.3\u00b0C', qualityScore: '9.6/10',
            blockchainHash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
            timestamps: { harvest: '06 Ene 05:30', packing: '06 Ene 11:00', cold: '06 Ene 13:30', export: '07 Ene 06:00' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-AV-012345', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-06-15', validUntil: '2026-06-15' },
                { type: 'APEAM', number: 'APEAM-2026-1178', issuer: 'APEAM Michoac\u00e1n', issuedDate: '2025-08-01', validUntil: '2026-08-01' }
            ],
            blockchain: { hash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', network: 'Polygon Amoy Testnet', blockNumber: 50278901, timestamp: 1736150400, txHash: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e' },
            gps: { latitude: 19.2089, longitude: -101.9734, elevation: '1540 msnm' },
            qualityMetrics: { dryMatter: '21.8%', weight: '225g', color: 'Verde oscuro', firmness: 'Firme', temperature: '5-7\u00b0C' },
            packaging: { type: 'Caja 4kg', lot: 'AB-HASS-2026-456', quantity: '180 kg', boxesCount: 45 },
            traceability: { field: 'Huerta La Esperanza', lot: 'Lote 11', block: 'Bloque D', packingHouse: 'Empacadora Ario Export', coolingDate: '2026-01-06 13:30', dispatchDate: '2026-01-07 06:00' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0x6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcdef' },
                { type: 'Certificado de Calidad', url: '#', hash: '0xf6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcde' }
            ]
        },

        // ==========================================
        // FRESAS (3 entries)
        // ==========================================
        'AB-FRES-2026-001': {
            status: 'valid', product: 'Fresas Premium Albion', variety: 'Albion',
            origin: 'Zapotl\u00e1n el Grande, Jalisco, M\u00e9xico', region: 'Jalisco', producer: 'Berries de Jalisco S.A.',
            harvestDate: '2026-01-06', packingDate: '2026-01-06', exportDate: '2026-01-07', expiryDate: '2026-01-20',
            destination: 'Los Angeles, USA', brix: '9.8\u00b0', ph: '3.4', avgTemp: '2.5\u00b0C', qualityScore: '9.7/10',
            blockchainHash: 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
            timestamps: { harvest: '06 Ene 04:30', packing: '06 Ene 08:00', cold: '06 Ene 09:30', export: '07 Ene 05:00' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-FF-123456', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-02-20', validUntil: '2026-02-20' },
                { type: 'GlobalGAP', number: '4050000567890', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-04-15', validUntil: '2026-04-15' }
            ],
            blockchain: { hash: 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2', network: 'Polygon Amoy Testnet', blockNumber: 50267890, timestamp: 1736137800, txHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f' },
            gps: { latitude: 19.7742, longitude: -103.4614, elevation: '1510 msnm' },
            qualityMetrics: { brix: '9.8\u00b0', pH: '3.4', humidity: '89.5%', size: '28mm di\u00e1metro', color: 'Rojo brillante (Pantone 185C)', firmness: 'Firme', temperature: '2-4\u00b0C' },
            packaging: { type: 'Clamshell 250g', lot: 'AB-FRES-2026-001', quantity: '125 kg', boxesCount: 500 },
            traceability: { field: 'Rancho Las Fresas', lot: 'Lote 7', block: 'Bloque E', packingHouse: 'Empacadora Berries Premium Jalisco', coolingDate: '2026-01-06 09:30', dispatchDate: '2026-01-07 05:00' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0x7890123456abcdef7890123456abcdef7890123456abcdef7890123456abcdef' },
                { type: 'Certificado de Calidad', url: '#', hash: '0xa7890123456abcdef7890123456abcdef7890123456abcdef7890123456abcde' }
            ]
        },
        'AB-FRES-2026-127': {
            status: 'valid', product: 'Fresas Festival Export', variety: 'Festival',
            origin: 'Irapuato, Guanajuato, M\u00e9xico', region: 'Guanajuato', producer: 'Fresas de Irapuato S.P.R.',
            harvestDate: '2026-01-04', packingDate: '2026-01-04', exportDate: '2026-01-05', expiryDate: '2026-01-18',
            destination: 'Toronto, Canad\u00e1', brix: '10.2\u00b0', ph: '3.3', avgTemp: '2.2\u00b0C', qualityScore: '9.8/10',
            blockchainHash: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
            timestamps: { harvest: '04 Ene 04:00', packing: '04 Ene 07:30', cold: '04 Ene 09:00', export: '05 Ene 04:30' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-FF-234567', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-03-10', validUntil: '2026-03-10' },
                { type: 'GlobalGAP', number: '4050000678901', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-05-20', validUntil: '2026-05-20' }
            ],
            blockchain: { hash: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4', network: 'Polygon Amoy Testnet', blockNumber: 50189456, timestamp: 1735966200, txHash: '0x8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a' },
            gps: { latitude: 20.6767, longitude: -101.3556, elevation: '1730 msnm' },
            qualityMetrics: { brix: '10.2\u00b0', pH: '3.3', humidity: '88.2%', size: '32mm di\u00e1metro', color: 'Rojo brillante', firmness: '\u00d3ptima', temperature: '2-4\u00b0C' },
            packaging: { type: 'Clamshell 250g', lot: 'AB-FRES-2026-127', quantity: '150 kg', boxesCount: 600 },
            traceability: { field: 'Agr\u00edcola San Juan', lot: 'Lote 12', block: 'Bloque A', packingHouse: 'Empacadora Irapuato Fresh', coolingDate: '2026-01-04 09:00', dispatchDate: '2026-01-05 04:30' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0x8901234567abcdef8901234567abcdef8901234567abcdef8901234567abcdef' },
                { type: 'Certificado de Calidad', url: '#', hash: '0xb8901234567abcdef8901234567abcdef8901234567abcdef8901234567abcde' }
            ]
        },
        'AB-FRES-2025-892': {
            status: 'valid', product: 'Fresas Camino Real Premium', variety: 'Camino Real',
            origin: 'San Quint\u00edn, Baja California, M\u00e9xico', region: 'Baja California', producer: 'BerryMex del Pac\u00edfico',
            harvestDate: '2025-12-20', packingDate: '2025-12-20', exportDate: '2025-12-21', expiryDate: '2026-01-03',
            destination: 'Phoenix, USA', brix: '10.8\u00b0', ph: '3.5', avgTemp: '2.0\u00b0C', qualityScore: '9.9/10',
            blockchainHash: 'b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
            timestamps: { harvest: '20 Dic 05:00', packing: '20 Dic 08:30', cold: '20 Dic 10:00', export: '21 Dic 04:00' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-FF-345678', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-01-15', validUntil: '2026-01-15' },
                { type: 'USDA Organic', number: 'USDA-ORG-89345', issuer: 'USDA National Organic Program', issuedDate: '2025-04-01', validUntil: '2026-04-01' }
            ],
            blockchain: { hash: 'b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', network: 'Polygon Amoy Testnet', blockNumber: 49912345, timestamp: 1734678000, txHash: '0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b' },
            gps: { latitude: 30.5296, longitude: -115.9463, elevation: '45 msnm' },
            qualityMetrics: { brix: '10.8\u00b0', pH: '3.5', humidity: '87.8%', size: '30mm di\u00e1metro', color: 'Rojo intenso brillante', firmness: 'Firme', temperature: '2-4\u00b0C' },
            packaging: { type: 'Clamshell 250g', lot: 'AB-FRES-2025-892', quantity: '175 kg', boxesCount: 700 },
            traceability: { field: 'Rancho Costa Azul', lot: 'Lote 5', block: 'Bloque C', packingHouse: 'Empacadora San Quint\u00edn Export', coolingDate: '2025-12-20 10:00', dispatchDate: '2025-12-21 04:00' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0x9012345678abcdef9012345678abcdef9012345678abcdef9012345678abcdef' },
                { type: 'Certificado Org\u00e1nico USDA', url: '#', hash: '0xc9012345678abcdef9012345678abcdef9012345678abcdef9012345678abcde' }
            ]
        },

        // ==========================================
        // ARANDANOS (3 entries)
        // ==========================================
        'AB-ARAN-2026-045': {
            status: 'valid', product: 'Ar\u00e1ndanos Biloxi Premium', variety: 'Biloxi',
            origin: 'Zapotl\u00e1n el Grande, Jalisco, M\u00e9xico', region: 'Jalisco', producer: 'BlueBerries M\u00e9xico S.A.',
            harvestDate: '2026-01-05', packingDate: '2026-01-05', exportDate: '2026-01-06', expiryDate: '2026-01-26',
            destination: 'Londres, UK', brix: '13.5\u00b0', ph: '3.1', avgTemp: '1.8\u00b0C', qualityScore: '9.8/10',
            blockchainHash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
            timestamps: { harvest: '05 Ene 05:00', packing: '05 Ene 09:00', cold: '05 Ene 10:30', export: '06 Ene 05:30' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-BB-234567', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-03-25', validUntil: '2026-03-25' },
                { type: 'GlobalGAP', number: '4050000789012', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-06-10', validUntil: '2026-06-10' }
            ],
            blockchain: { hash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', network: 'Polygon Amoy Testnet', blockNumber: 50245678, timestamp: 1736056800, txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2' },
            gps: { latitude: 19.7756, longitude: -103.4578, elevation: '1520 msnm' },
            qualityMetrics: { brix: '13.5\u00b0', pH: '3.1', humidity: '82.5%', size: '14mm di\u00e1metro', color: 'Azul oscuro con bloom', firmness: 'Firme', temperature: '0-2\u00b0C' },
            packaging: { type: 'Clamshell 125g', lot: 'AB-ARAN-2026-045', quantity: '100 kg', boxesCount: 800 },
            traceability: { field: 'Huerta Los Ar\u00e1ndanos', lot: 'Lote 3', block: 'Bloque B', packingHouse: 'Empacadora BlueMex Jalisco', coolingDate: '2026-01-05 10:30', dispatchDate: '2026-01-06 05:30' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0xa123456789abcdefa123456789abcdefa123456789abcdefa123456789abcdef' },
                { type: 'Certificado de Calidad', url: '#', hash: '0xda123456789abcdefa123456789abcdefa123456789abcdefa123456789abcde' }
            ]
        },
        'AB-ARAN-2025-734': {
            status: 'valid', product: 'Ar\u00e1ndanos Snowchaser Org\u00e1nico', variety: 'Snowchaser',
            origin: 'Los Reyes, Michoac\u00e1n, M\u00e9xico', region: 'Michoac\u00e1n', producer: 'Berries Org\u00e1nicos de Michoac\u00e1n',
            harvestDate: '2025-12-15', packingDate: '2025-12-15', exportDate: '2025-12-16', expiryDate: '2026-01-05',
            destination: 'Amsterdam, Pa\u00edses Bajos', brix: '14.2\u00b0', ph: '3.0', avgTemp: '1.5\u00b0C', qualityScore: '9.9/10',
            blockchainHash: 'd9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
            timestamps: { harvest: '15 Dic 04:30', packing: '15 Dic 08:00', cold: '15 Dic 09:30', export: '16 Dic 05:00' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-BB-345678', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-04-15', validUntil: '2026-04-15' },
                { type: 'USDA Organic', number: 'USDA-ORG-90456', issuer: 'USDA National Organic Program', issuedDate: '2025-05-01', validUntil: '2026-05-01' }
            ],
            blockchain: { hash: 'd9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0', network: 'Polygon Amoy Testnet', blockNumber: 49834567, timestamp: 1734245400, txHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3' },
            gps: { latitude: 19.5847, longitude: -102.4723, elevation: '1340 msnm' },
            qualityMetrics: { brix: '14.2\u00b0', pH: '3.0', humidity: '81.8%', size: '15mm di\u00e1metro', color: 'Azul intenso con bloom', firmness: '\u00d3ptima', temperature: '0-2\u00b0C' },
            packaging: { type: 'Clamshell 125g', lot: 'AB-ARAN-2025-734', quantity: '80 kg', boxesCount: 640 },
            traceability: { field: 'Huerta Azul Michoac\u00e1n', lot: 'Lote 9', block: 'Bloque A', packingHouse: 'Empacadora Berry Gold', coolingDate: '2025-12-15 09:30', dispatchDate: '2025-12-16 05:00' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0xb234567890abcdefb234567890abcdefb234567890abcdefb234567890abcdef' },
                { type: 'Certificado Org\u00e1nico USDA', url: '#', hash: '0xeb234567890abcdefb234567890abcdefb234567890abcdefb234567890abcde' }
            ]
        },
        'AB-ARAN-2026-201': {
            status: 'valid', product: 'Ar\u00e1ndanos Emerald Select', variety: 'Emerald',
            origin: 'Culiac\u00e1n, Sinaloa, M\u00e9xico', region: 'Sinaloa', producer: 'Berries del Noroeste S.A.',
            harvestDate: '2026-01-02', packingDate: '2026-01-02', exportDate: '2026-01-03', expiryDate: '2026-01-23',
            destination: 'Miami, USA', brix: '12.8\u00b0', ph: '3.2', avgTemp: '1.6\u00b0C', qualityScore: '9.6/10',
            blockchainHash: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
            timestamps: { harvest: '02 Ene 04:45', packing: '02 Ene 08:30', cold: '02 Ene 10:00', export: '03 Ene 05:00' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-BB-456789', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-05-20', validUntil: '2026-05-20' },
                { type: 'GlobalGAP', number: '4050000890123', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-07-15', validUntil: '2026-07-15' }
            ],
            blockchain: { hash: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2', network: 'Polygon Amoy Testnet', blockNumber: 50156789, timestamp: 1735797900, txHash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4' },
            gps: { latitude: 24.8091, longitude: -107.3940, elevation: '55 msnm' },
            qualityMetrics: { brix: '12.8\u00b0', pH: '3.2', humidity: '83.2%', size: '13mm di\u00e1metro', color: 'Azul oscuro con bloom', firmness: 'Firme', temperature: '0-2\u00b0C' },
            packaging: { type: 'Clamshell 125g', lot: 'AB-ARAN-2026-201', quantity: '90 kg', boxesCount: 720 },
            traceability: { field: 'Rancho Berry Sinaloa', lot: 'Lote 6', block: 'Bloque D', packingHouse: 'Empacadora Noroeste Fresh', coolingDate: '2026-01-02 10:00', dispatchDate: '2026-01-03 05:00' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0xc345678901abcdefc345678901abcdefc345678901abcdefc345678901abcdef' },
                { type: 'Certificado de Calidad', url: '#', hash: '0xfc345678901abcdefc345678901abcdefc345678901abcdefc345678901abcde' }
            ]
        },

        // ==========================================
        // ZARZAMORAS (2 entries)
        // ==========================================
        'AB-ZARZ-2026-089': {
            status: 'valid', product: 'Zarzamoras Tupy Premium', variety: 'Tupy',
            origin: 'Los Reyes, Michoac\u00e1n, M\u00e9xico', region: 'Michoac\u00e1n', producer: 'Zarzamoras del Pac\u00edfico',
            harvestDate: '2026-01-04', packingDate: '2026-01-04', exportDate: '2026-01-05', expiryDate: '2026-01-18',
            destination: 'Par\u00eds, Francia', brix: '11.2\u00b0', ph: '3.4', avgTemp: '2.0\u00b0C', qualityScore: '9.7/10',
            blockchainHash: 'f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
            timestamps: { harvest: '04 Ene 05:15', packing: '04 Ene 09:00', cold: '04 Ene 10:30', export: '05 Ene 06:00' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-BK-345678', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-04-10', validUntil: '2026-04-10' },
                { type: 'GlobalGAP', number: '4050000901234', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-06-25', validUntil: '2026-06-25' }
            ],
            blockchain: { hash: 'f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4', network: 'Polygon Amoy Testnet', blockNumber: 50201234, timestamp: 1735970700, txHash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5' },
            gps: { latitude: 19.5892, longitude: -102.4698, elevation: '1360 msnm' },
            qualityMetrics: { brix: '11.2\u00b0', pH: '3.4', humidity: '85.5%', weight: '6.5g por fruto', color: 'Negro brillante', firmness: 'Firme', temperature: '2-4\u00b0C' },
            packaging: { type: 'Clamshell 170g', lot: 'AB-ZARZ-2026-089', quantity: '85 kg', boxesCount: 500 },
            traceability: { field: 'Huerta La Zarzamora', lot: 'Lote 4', block: 'Bloque B', packingHouse: 'Empacadora Los Reyes Berry', coolingDate: '2026-01-04 10:30', dispatchDate: '2026-01-05 06:00' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0xd456789012abcdefd456789012abcdefd456789012abcdefd456789012abcdef' },
                { type: 'Certificado de Calidad', url: '#', hash: '0xad456789012abcdefd456789012abcdefd456789012abcdefd456789012abcde' }
            ]
        },
        'AB-ZARZ-2025-456': {
            status: 'valid', product: 'Zarzamoras Cherokee Select', variety: 'Cherokee',
            origin: 'Tamazula, Jalisco, M\u00e9xico', region: 'Jalisco', producer: 'Berries Premium de Jalisco',
            harvestDate: '2025-12-22', packingDate: '2025-12-22', exportDate: '2025-12-23', expiryDate: '2026-01-05',
            destination: 'Berl\u00edn, Alemania', brix: '10.5\u00b0', ph: '3.6', avgTemp: '2.2\u00b0C', qualityScore: '9.5/10',
            blockchainHash: 'a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
            timestamps: { harvest: '22 Dic 05:30', packing: '22 Dic 09:30', cold: '22 Dic 11:00', export: '23 Dic 05:30' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-BK-456789', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-05-15', validUntil: '2026-05-15' },
                { type: 'Rainforest Alliance', number: 'RA-2025-78234', issuer: 'Rainforest Alliance Certified', issuedDate: '2025-03-20', validUntil: '2026-03-20' }
            ],
            blockchain: { hash: 'a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6', network: 'Polygon Amoy Testnet', blockNumber: 49923456, timestamp: 1734850200, txHash: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6' },
            gps: { latitude: 19.6734, longitude: -103.2456, elevation: '1180 msnm' },
            qualityMetrics: { brix: '10.5\u00b0', pH: '3.6', humidity: '86.2%', weight: '7.2g por fruto', color: 'Negro intenso brillante', firmness: '\u00d3ptima', temperature: '2-4\u00b0C' },
            packaging: { type: 'Clamshell 170g', lot: 'AB-ZARZ-2025-456', quantity: '75 kg', boxesCount: 440 },
            traceability: { field: 'Rancho El Cielo', lot: 'Lote 8', block: 'Bloque C', packingHouse: 'Empacadora Tamazula Export', coolingDate: '2025-12-22 11:00', dispatchDate: '2025-12-23 05:30' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0xe567890123abcdefe567890123abcdefe567890123abcdefe567890123abcdef' },
                { type: 'Certificado Rainforest Alliance', url: '#', hash: '0xbe567890123abcdefe567890123abcdefe567890123abcdefe567890123abcde' }
            ]
        },

        // ==========================================
        // FRAMBUESAS (2 entries)
        // ==========================================
        'AB-FRAM-2026-312': {
            status: 'valid', product: 'Frambuesas Heritage Premium', variety: 'Heritage',
            origin: 'Salamanca, Guanajuato, M\u00e9xico', region: 'Guanajuato', producer: 'Frambuesas de Guanajuato S.A.',
            harvestDate: '2026-01-03', packingDate: '2026-01-03', exportDate: '2026-01-04', expiryDate: '2026-01-17',
            destination: 'Nueva York, USA', brix: '11.5\u00b0', ph: '3.3', avgTemp: '1.8\u00b0C', qualityScore: '9.8/10',
            blockchainHash: 'b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
            timestamps: { harvest: '03 Ene 04:45', packing: '03 Ene 08:00', cold: '03 Ene 09:30', export: '04 Ene 05:00' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-RP-456789', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-06-01', validUntil: '2026-06-01' },
                { type: 'GlobalGAP', number: '4050000012345', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-08-10', validUntil: '2026-08-10' }
            ],
            blockchain: { hash: 'b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8', network: 'Polygon Amoy Testnet', blockNumber: 50178901, timestamp: 1735883100, txHash: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7' },
            gps: { latitude: 20.5739, longitude: -101.1956, elevation: '1720 msnm' },
            qualityMetrics: { brix: '11.5\u00b0', pH: '3.3', humidity: '84.5%', weight: '5.2g por fruto', color: 'Rojo intenso', firmness: 'Firme', temperature: '0-2\u00b0C' },
            packaging: { type: 'Clamshell 125g', lot: 'AB-FRAM-2026-312', quantity: '62 kg', boxesCount: 500 },
            traceability: { field: 'Huerta La Frambuesa Dorada', lot: 'Lote 2', block: 'Bloque A', packingHouse: 'Empacadora Guanajuato Berry', coolingDate: '2026-01-03 09:30', dispatchDate: '2026-01-04 05:00' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0xf678901234abcdeff678901234abcdeff678901234abcdeff678901234abcdef' },
                { type: 'Certificado de Calidad', url: '#', hash: '0xcf678901234abcdeff678901234abcdeff678901234abcdeff678901234abcde' }
            ]
        },
        'AB-FRAM-2026-078': {
            status: 'valid', product: 'Frambuesas Autumn Bliss', variety: 'Autumn Bliss',
            origin: 'San Quint\u00edn, Baja California, M\u00e9xico', region: 'Baja California', producer: 'Pacific Berries de M\u00e9xico',
            harvestDate: '2026-01-01', packingDate: '2026-01-01', exportDate: '2026-01-02', expiryDate: '2026-01-15',
            destination: 'San Diego, USA', brix: '12.2\u00b0', ph: '3.4', avgTemp: '1.5\u00b0C', qualityScore: '9.7/10',
            blockchainHash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
            timestamps: { harvest: '01 Ene 05:00', packing: '01 Ene 08:30', cold: '01 Ene 10:00', export: '02 Ene 04:30' },
            certifications: [
                { type: 'SENASICA', number: 'MEX-RP-567890', issuer: 'SENASICA M\u00e9xico', issuedDate: '2025-07-15', validUntil: '2026-07-15' },
                { type: 'Rainforest Alliance', number: 'RA-2025-89345', issuer: 'Rainforest Alliance Certified', issuedDate: '2025-04-25', validUntil: '2026-04-25' }
            ],
            blockchain: { hash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0', network: 'Polygon Amoy Testnet', blockNumber: 50134567, timestamp: 1735711800, txHash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8' },
            gps: { latitude: 30.5312, longitude: -115.9478, elevation: '48 msnm' },
            qualityMetrics: { brix: '12.2\u00b0', pH: '3.4', humidity: '83.8%', weight: '4.8g por fruto', color: 'Rojo brillante intenso', firmness: '\u00d3ptima', temperature: '0-2\u00b0C' },
            packaging: { type: 'Clamshell 125g', lot: 'AB-FRAM-2026-078', quantity: '55 kg', boxesCount: 440 },
            traceability: { field: 'Rancho Pacific Berry', lot: 'Lote 10', block: 'Bloque E', packingHouse: 'Empacadora Baja Berry Fresh', coolingDate: '2026-01-01 10:00', dispatchDate: '2026-01-02 04:30' },
            documents: [
                { type: 'Certificado Fitosanitario', url: '#', hash: '0xa789012345abcdefa789012345abcdefa789012345abcdefa789012345abcdef' },
                { type: 'Certificado Rainforest Alliance', url: '#', hash: '0xda789012345abcdefa789012345abcdefa789012345abcdefa789012345abcde' }
            ]
        },

        // ==========================================
        // CODIGO INVALIDO (para testing)
        // ==========================================
        'AB-INVA-9999-999': {
            status: 'invalid',
            error: 'C\u00f3digo de lote no encontrado en el sistema',
            suggestions: ['AB-HASS-2026-001', 'AB-FRES-2026-001', 'AB-ARAN-2026-045']
        }
    };

    /**
     * Get demo data for testing
     * @param {string} lotCode - Lot code
     * @returns {Promise<Object>} Demo validation result
     */
    async function getDemoData(lotCode) {
        await utils.delay(800);

        if (demoDatabase[lotCode]) {
            var data = demoDatabase[lotCode];
            if (data.status === 'invalid') {
                throw new Error('NOT_FOUND');
            }
            return data;
        }

        return generateDemoData(lotCode);
    }

    /**
     * Generate demo data for codes not in the database
     * @param {string} lotCode - Lot code
     * @returns {Object} Generated demo data
     */
    function generateDemoData(lotCode) {
        var isHass = lotCode.includes('HASS');
        var isBerry = lotCode.includes('BERR');

        var now = new Date();
        var harvestDate = new Date(now - 3 * 24 * 60 * 60 * 1000);

        return {
            status: 'valid',
            product: isHass ? 'Aguacate Hass' : (isBerry ? 'Berries Premium' : 'Producto Certificado'),
            origin: 'Michoac\u00e1n, M\u00e9xico',
            producer: 'Productor Certificado AgroBridge',
            harvestDate: harvestDate.toISOString().split('T')[0],
            packingDate: harvestDate.toISOString().split('T')[0],
            exportDate: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            destination: 'Mercado Internacional',
            brix: (10 + Math.random() * 5).toFixed(1) + '\u00b0',
            ph: (3 + Math.random() * 4).toFixed(1),
            avgTemp: (2 + Math.random() * 4).toFixed(1) + '\u00b0C',
            qualityScore: (9 + Math.random()).toFixed(1) + '/10',
            blockchainHash: utils.generateHash(),
            timestamps: {
                harvest: utils.formatDateTime(harvestDate),
                packing: utils.formatDateTime(new Date(harvestDate.getTime() + 6 * 60 * 60 * 1000)),
                cold: utils.formatDateTime(new Date(harvestDate.getTime() + 8 * 60 * 60 * 1000)),
                export: utils.formatDateTime(new Date(harvestDate.getTime() + 24 * 60 * 60 * 1000))
            }
        };
    }

    return {
        database: demoDatabase,
        getDemoData: getDemoData,
        generateDemoData: generateDemoData
    };
})();
