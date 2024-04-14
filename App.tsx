import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PulseIndicator } from './PulseIndicator';
import useBLE from './useBLE';
import DeviceModal from './DeviceConnectionModal';

const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    // heartRate,
    disconnectFromDevice,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // location popup will be showed
  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    console.log('isPermissionsEnabled', isPermissionsEnabled);
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    await scanForDevices();
    setIsModalVisible(true);
  };

  const handleSendData = async () => {
    console.log('tracking send data...');
    connectedDevice
      ?.connect()
      .then((device) => {
        return device.discoverAllServicesAndCharacteristics();
      })
      .then((device) => {
        console.log('device.id send data', device);
        device
          .writeCharacteristicWithResponseForService(
            '12ab',
            '34cd',
            'aGVsbG8gbWlzcyB0YXBweQ=='
          )
          .then((characteristic) => {
            console.log(
              `Sent data to device ${characteristic.value} Successfully`
            );
            return;
          })
          .catch((error: any) => {
            console.log('Error characteristic', error);
          });
      })
      .catch((error: any) => {
        console.log('Error sending data', error.message);
      });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        {connectedDevice ? (
          <>
            <PulseIndicator />
            <Text style={styles.heartRateTitleText}>
              Device connected: ${connectedDevice.id}
            </Text>
            {/* <Text style={styles.heartRateText}>{heartRate} bpm</Text> */}
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>Please Connect Device</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
      {connectedDevice && (
        <TouchableOpacity onPress={handleSendData} style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>{'Send data to device'}</Text>
        </TouchableOpacity>
      )}
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: '#FF6060',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default App;
