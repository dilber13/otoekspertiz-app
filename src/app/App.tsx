import React, {useEffect} from 'react';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import AppNavigator from '../navigation/AppNavigator';

async function requestAndroidPermissions(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const apiLevel = parseInt(Platform.Version as string, 10);

    if (apiLevel >= 31) {
      // Android 12+ için yeni BLE izinleri
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    } else {
      // Android 11 ve altı
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  } catch (err) {
    console.warn('İzin isteği başarısız:', err);
  }
}

export default function App() {
  useEffect(() => {
    requestAndroidPermissions();
  }, []);

  return <AppNavigator />;
}
