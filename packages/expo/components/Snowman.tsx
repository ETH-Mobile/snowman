import { COLORS } from '@/utils/constants';
import Device from '@/utils/device';
import base64 from 'base-64';
import { Contract, InterfaceAbi, JsonRpcProvider } from 'ethers';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';
import { useDeployedContractInfo, useNetwork } from '../hooks/eth-mobile';

type Props = { id: number };
export interface Metadata {
  name: string;
  image: string;
}

export default function Snowman({ id }: Props) {
  const [metadata, setMetadata] = useState<Metadata>();
  const [isLoading, setIsLoading] = useState(true);
  const network = useNetwork();
  const router = useRouter();

  const { data: snowmanContract, isLoading: isLoadingSnowmanContract } =
    useDeployedContractInfo({
      contractName: 'Snowman'
    });

  const getDetails = async () => {
    if (!snowmanContract) return;

    try {
      setIsLoading(true);
      const provider = new JsonRpcProvider(network.provider);

      const snowman = new Contract(
        snowmanContract.address,
        snowmanContract.abi as InterfaceAbi,
        provider
      );

      const tokenURI: string = await snowman.tokenURI(id);
      const metadata = JSON.parse(
        base64.decode(tokenURI.replace('data:application/json;base64,', ''))
      );
      const decodedMetadataImage = base64.decode(
        metadata.image.replace('data:image/svg+xml;base64,', '')
      );
      metadata.image = decodedMetadataImage;

      setMetadata(metadata);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDetails();
  }, [isLoadingSnowmanContract]);

  if (isLoading)
    return (
      <Card
        style={{
          width: Device.getDeviceWidth() * 0.4,
          height: Device.getDeviceWidth() * 0.4,
          backgroundColor: '#fafafa'
        }}
      >
        {null}
      </Card>
    );
  if (!metadata) return null;

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/closet',
          params: { id: id, name: metadata.name, image: metadata.image }
        })
      }
    >
      <SvgXml
        xml={metadata.image}
        width={Device.getDeviceWidth() * 0.95}
        height={Device.getDeviceWidth() * 0.95}
      />
      <View
        className="absolute top-10 left-4 px-2 rounded-4"
        style={{ backgroundColor: COLORS.primaryLight }}
      >
        <Text className="text-lg font-[Poppins]">{metadata.name}</Text>
      </View>
    </Pressable>
  );
}
