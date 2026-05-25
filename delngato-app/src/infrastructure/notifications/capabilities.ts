import Constants from 'expo-constants';
import * as Device from 'expo-device';

export function getPushCapabilities() {
  const isExpoGo = Constants.appOwnership === 'expo';
  const isDevice = Device.isDevice;
  
  return {
    supportsRemotePush: !isExpoGo && isDevice,
    supportsLocalNotifications: !isExpoGo,
    isExpoGo
  };
}
