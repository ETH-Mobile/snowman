import {
  useAccount,
  useDeployedContractInfo,
  useReadContract,
  useWriteContract
} from '@/hooks/eth-mobile';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { Abi } from 'abitype';
import base64 from 'base-64';
import { ethers, InterfaceAbi } from 'ethers';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { ActivityIndicator, Button, Card } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';
import { useToast } from 'react-native-toast-notifications';

type Props = {
  name: string;
};

export default function Accessory({ name }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [accessories, setAccessories] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const { address: connectedAccount } = useAccount();

  const { data: accessoryContract } = useDeployedContractInfo({
    contractName: name
  });

  const toast = useToast();

  const { readContract } = useReadContract();
  const { writeContractAsync } = useWriteContract({
    abi: accessoryContract?.abi as Abi,
    address: accessoryContract?.address as string,
    gasLimit: 500000n
  });

  const mint = async () => {
    if (!accessoryContract) return;

    setIsMinting(true);
    try {
      await writeContractAsync({
        functionName: 'mint',
        value: ethers.parseEther('0.01')
      });

      toast.show(`Minted One Accessory`, {
        type: 'success',
        placement: 'top'
      });

      await getAccessories();
    } catch (error) {
      console.error(error);
      toast.show(`Error Minting Accessory`, {
        type: 'danger',
        placement: 'top'
      });
    }
    setIsMinting(false);
  };

  const _getAccessories = async () => {
    if (!accessoryContract) return;

    const balance = Number(
      await readContract({
        abi: accessoryContract.abi as InterfaceAbi,
        address: accessoryContract.address,
        functionName: 'balanceOf',
        args: [connectedAccount]
      })
    );

    setBalance(balance);

    const tokenURIs = [];
    for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
      try {
        const tokenId = await readContract({
          abi: accessoryContract.abi as InterfaceAbi,
          address: accessoryContract.address,
          functionName: 'tokenOfOwnerByIndex',
          args: [connectedAccount, tokenIndex]
        });

        const tokenURI = await readContract({
          abi: accessoryContract.abi as InterfaceAbi,
          address: accessoryContract.address,
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

        tokenURIs.push({ id: tokenId, ...metadata });
      } catch (error) {
        console.error(error);
      }
    }
    setAccessories(tokenURIs);
  };

  const getAccessories = async () => {
    if (!accessoryContract) return;
    setIsLoading(true);

    try {
      await _getAccessories();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAccessories();
  }, [accessoryContract]);

  const refresh = async () => {
    await _getAccessories();
  };

  return (
    <ScrollView
      className="flex-1 bg-white px-2.5 py-1"
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
      <View className="flex-row justify-between items-center">
        <Text
          className="text-lg font-semibold mb-[-5px]"
          style={{ fontSize: FONT_SIZE.lg }}
        >
          Balance: {balance}
        </Text>
        <Button
          mode="contained"
          onPress={mint}
          className="self-end rounded-full"
          labelStyle={[{ fontSize: FONT_SIZE.md, color: 'white' }]}
          loading={isMinting}
        >
          Mint
        </Button>
      </View>

      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <View className="flex-row flex-wrap justify-center gap-2.5 mt-2.5">
          {accessories?.map(accessory => (
            <Card key={accessory.id} className="bg-white pr-1.5">
              <SvgXml
                xml={accessory.image}
                width={Device.getDeviceWidth() * 0.4}
                height={Device.getDeviceWidth() * 0.4}
              />
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
