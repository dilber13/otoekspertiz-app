import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import OBD2Screen from '../screens/OBD2Screen';
import CameraScreen from '../screens/CameraScreen';
import ReportScreen from '../screens/ReportScreen';
import VehicleFormScreen from '../screens/VehicleFormScreen';

import {COLORS} from '../utils/constants';
import {RootTabParamList, RootStackParamList} from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.darkBg,
          borderTopColor: COLORS.border,
          height: 65,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {fontSize: 11, fontWeight: '600'},
        tabBarIcon: ({focused, color, size}) => {
          let iconName = 'home';
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'OBD2':
              iconName = focused ? 'bluetooth-connect' : 'bluetooth';
              break;
            case 'Camera':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Report':
              iconName = focused ? 'file-document' : 'file-document-outline';
              break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{title: 'Ana Sayfa'}} />
      <Tab.Screen name="OBD2" component={OBD2Screen} options={{title: 'OBD2 / ELM327'}} />
      <Tab.Screen name="Camera" component={CameraScreen} options={{title: 'Hasar Tespiti'}} />
      <Tab.Screen name="Report" component={ReportScreen} options={{title: 'Rapor'}} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: COLORS.darkBg},
          headerTintColor: COLORS.primary,
          headerTitleStyle: {fontWeight: 'bold', color: COLORS.textPrimary},
          contentStyle: {backgroundColor: COLORS.background},
        }}>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="VehicleForm"
          component={VehicleFormScreen}
          options={{title: 'Araç Bilgileri', headerBackTitle: 'Geri'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
