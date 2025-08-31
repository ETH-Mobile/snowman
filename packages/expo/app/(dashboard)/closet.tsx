import Header from '@/components/Header';
import { Metadata } from '@/components/Snowman';
import {
  useDeployedContractInfo,
  useReadContract,
  useScaffoldWriteContract
} from '@/hooks/eth-mobile';
import Accessory from '@/modules/closet/components/Accessory';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import base64 from 'base-64';
import { InterfaceAbi } from 'ethers';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';
import { useToast } from 'react-native-toast-notifications';

export default function Closet() {
  const token = useLocalSearchParams();
  const tokenId = Number(token.id);

  const [metadata, setMetadata] = useState<Metadata>({
    name: typeof token.name === 'string' ? token.name : '',
    image: typeof token.image === 'string' ? token.image : ''
  });
  const [isComposing, setIsComposing] = useState(false);
  const [hasAccessory, setHasAccessory] = useState(false);

  const { data: snowmanContract } = useDeployedContractInfo({
    contractName: 'Snowman'
  });
  const { data: beltContract } = useDeployedContractInfo({
    contractName: 'Belt'
  });
  const { data: hatContract } = useDeployedContractInfo({
    contractName: 'Hat'
  });
  const { data: scarfContract } = useDeployedContractInfo({
    contractName: 'Scarf'
  });

  const { readContract } = useReadContract();
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: 'Snowman',
    gasLimit: 500000n
  });

  const toast = useToast();

  const _getSnowmanMetadata = async () => {
    if (!snowmanContract) return;

    const tokenURI: string = await readContract({
      address: snowmanContract?.address,
      abi: snowmanContract?.abi as InterfaceAbi,
      functionName: 'tokenURI',
      args: [tokenId]
    });

    const metadata = JSON.parse(
      base64.decode(tokenURI.replace('data:application/json;base64,', ''))
    );
    const decodedMetadataImage = base64.decode(
      metadata.image.replace('data:image/svg+xml;base64,', '')
    );
    metadata.image = decodedMetadataImage;

    setMetadata(metadata);
  };

  const checkAccessory = async () => {
    if (!snowmanContract || !beltContract || !hatContract || !scarfContract)
      return;

    const hasBelt = await readContract({
      address: snowmanContract.address,
      abi: snowmanContract.abi as InterfaceAbi,
      functionName: 'hasAccessory',
      args: [beltContract.address, tokenId]
    });

    const hasHat = await readContract({
      address: snowmanContract.address,
      abi: snowmanContract.abi as InterfaceAbi,
      functionName: 'hasAccessory',
      args: [hatContract.address, tokenId]
    });

    const hasScarf = await readContract({
      address: snowmanContract.address,
      abi: snowmanContract.abi as InterfaceAbi,
      functionName: 'hasAccessory',
      args: [scarfContract.address, tokenId]
    });

    setHasAccessory(hasBelt || hasHat || hasScarf);
  };

  useEffect(() => {
    checkAccessory();
  }, [snowmanContract, beltContract, hatContract, scarfContract]);

  const refresh = async () => {
    await _getSnowmanMetadata();
  };

  const strip = async () => {
    if (!snowmanContract?.address || isComposing) return;

    setIsComposing(true);

    try {
      await writeContractAsync({
        functionName: 'removeAllAccessories',
        args: [tokenId]
      });

      toast.show('Removed all accessories from Snowman', {
        type: 'success',
        placement: 'top'
      });
      setHasAccessory(false);
      refresh();
    } catch (error) {
      console.log(error);
      toast.show(JSON.stringify(error), { type: 'danger', placement: 'top' });
    } finally {
      setIsComposing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Header title={`Snowman #${tokenId}`} />

        <View
          className="items-center self-center my-5"
          style={{
            width: Device.getDeviceWidth() * 0.6,
            height: Device.getDeviceWidth() * 0.6
          }}
        >
          <SvgXml
            xml={metadata.image}
            width={Device.getDeviceWidth() * 0.6}
            height={Device.getDeviceWidth() * 0.6}
          />
        </View>

        {hasAccessory && (
          <Button
            mode="contained"
            onPress={strip}
            className="w-[30%] self-center py-1.5 rounded-3xl mb-2.5"
            style={{ backgroundColor: COLORS.lightRed }}
            labelStyle={{
              fontFamily: 'Poppins-Medium',
              color: COLORS.error,
              fontSize: FONT_SIZE.lg
            }}
            disabled={isComposing}
            loading={isComposing}
          >
            Strip
          </Button>
        )}

        <Accessory
          name="Belt"
          snowman={{ address: snowmanContract?.address, id: tokenId }}
          onAddToSnowman={refresh}
          checkForAnyAccessory={checkAccessory}
        />
        <Accessory
          name="Hat"
          snowman={{ address: snowmanContract?.address, id: tokenId }}
          onAddToSnowman={refresh}
          checkForAnyAccessory={checkAccessory}
        />
        <Accessory
          name="Scarf"
          snowman={{ address: snowmanContract?.address, id: tokenId }}
          onAddToSnowman={refresh}
          checkForAnyAccessory={checkAccessory}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
