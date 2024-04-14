import { useMemo, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, LogLevel } from 'react-native-ble-plx';

import * as ExpoDevice from 'expo-device';

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  allDevices: Device[];
  connectToDevice: (deviceId: Device) => Promise<void>;
  connectedDevice: Device | null;
  disconnectFromDevice(): void;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => {
    console.log('tracking memo...');
    return new BleManager();
  }, []);
  bleManager.setLogLevel(LogLevel.Verbose);

  const [allDevices, setAllDevices] = useState<Device[]>([]); // to control connected device
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Scan Permission',
        message: 'App requires Bluetooth Scanning',
        buttonPositive: 'OK',
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Scan Permission',
        message: 'App requires Bluetooth Connecting',
        buttonPositive: 'OK',
      }
    );
    const bluetoothFineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Fine Location',
        message: 'App requires fine location',
        buttonPositive: 'OK',
      }
    );

    return (
      bluetoothScanPermission === 'granted' &&
      bluetoothConnectPermission === 'granted' &&
      bluetoothFineLocationPermission === 'granted'
    );
  };

  const requestPermissions = async () => {
    console.log('Platform ...', Platform.OS);
    console.log('ExpoDevice.platformApiLevel ...', ExpoDevice.platformApiLevel);
    if (Platform.OS === 'android') {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth requires Location',
            buttonPositive: 'OK',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionGranted =
          await requestAndroid31Permissions();
        return isAndroid31PermissionGranted;
      }
    }
    // for IOS
    return true;
  };

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () => {
    console.log('Scan peripheral tracking ...');
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Error here: ', error);
      }
      if (device?.id === 'F4:DB:E3:34:F5:0E') console.log('My device', device);
      if (device && device?.id && device.isConnectable) {
        // if (device && device.name?.includes('thanhpc')) {
        setAllDevices((prevState) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
    } catch (e) {
      console.log('Error connection', e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
  };
}

export default useBLE;
