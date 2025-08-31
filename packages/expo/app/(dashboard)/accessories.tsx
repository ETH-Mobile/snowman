import Header from '@/components/Header';
import Belt from '@/modules/accessories/components/Belt';
import Hat from '@/modules/accessories/components/Hat';
import Scarf from '@/modules/accessories/components/Scarf';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default function Accessories() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <Header title="Accessories" />

        <View className="p-8 bg-white items-center">
          <Text className="font-[Poppins] text-base">
            Get an accessory for your
          </Text>
          <Text className="font-[Poppins-Medium] text-xl ml-4">Snowman☃️</Text>
          <Text className="text-center mt-4 font-[Poppins] text-base max-w-[70%]">
            Mint one for <Text style={{ color: COLORS.primary }}>0.01 ETH</Text>
          </Text>
        </View>

        <Tab.Navigator
          screenOptions={{
            tabBarIndicatorStyle: {
              backgroundColor: COLORS.primary
            },
            tabBarLabelStyle: {
              textTransform: 'none',
              fontSize: FONT_SIZE['lg'],
              fontFamily: 'Poppins'
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: '#C7C6C7'
          }}
        >
          <Tab.Screen name="Belt 🥋" component={Belt} />
          <Tab.Screen name="Hat 🎩" component={Hat} />
          <Tab.Screen name="Scarf 🧣" component={Scarf} />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
}
