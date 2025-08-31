import CustomButton from '@/components/buttons/CustomButton';
import Snowman from '@/components/Snowman';
import {
  useAccount,
  useDeployedContractInfo,
  useNetwork
} from '@/hooks/eth-mobile';
import { COLORS } from '@/utils/constants';
import Device from '@/utils/device';
import { Contract, InterfaceAbi, JsonRpcProvider } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

type Props = { balance: number };

export default function SnowmanList({ balance }: Props) {
  const [snowmanBalance, setSnowmanBalance] = useState(balance);
  const [snowmen, setSnowmen] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const account = useAccount();
  const network = useNetwork();

  const { data: snowmanContract, isLoading: isLoadingSnowmanContract } =
    useDeployedContractInfo({
      contractName: 'Snowman'
    });

  const getSnowmen = async () => {
    if (isLoadingSnowmanContract) return;

    try {
      setIsLoading(true);
      setHasError(false);
      setSnowmanBalance(balance);

      const provider = new JsonRpcProvider(network.provider);

      // @ts-ignore
      const snowman = new Contract(
        snowmanContract?.address as string,
        snowmanContract?.abi as InterfaceAbi,
        provider
      );
      const tokenIds = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          const tokenId = await snowman.tokenOfOwnerByIndex(
            account.address,
            tokenIndex
          );
          tokenIds.push({ id: tokenId });
        } catch (error) {
          console.error(error);
        }
      }

      setSnowmen(tokenIds.reverse());
    } catch (error) {
      console.error(error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSnowmen();
  }, [balance, isLoadingSnowmanContract]);

  const renderSnowmanList = () => {
    if (hasError) {
      return (
        <View className="flex-1 justify-center items-center p-4 mt-4">
          <Text className="text-center text-lg font-[Poppins]">
            Failed to load your Snowmen
          </Text>
          <CustomButton text="Retry" onPress={getSnowmen} />
        </View>
      );
    }

    if (!snowmen && isLoading)
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );

    if (!snowmen || snowmen.length === 0) return;

    return (
      <Carousel
        width={Device.getDeviceWidth()}
        height={Device.getDeviceHeight() * 0.7}
        data={snowmen}
        renderItem={({ item }) => (
          <Snowman key={item.id} id={Number(item.id)} />
        )}
        ref={ref}
        onProgressChange={progress}
        mode="parallax"
        loop={false}
        pagingEnabled={true}
        snapEnabled={true}
      />
    );
  };

  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  return (
    <>
      <Text className="text-center text-xl font-[Poppins]">
        You own {snowmanBalance} Snowman☃️
      </Text>
      {renderSnowmanList()}
    </>
  );
}
