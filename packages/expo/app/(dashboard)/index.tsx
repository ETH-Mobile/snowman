import CustomButton from '@/components/buttons/CustomButton';
import { CopyableText } from '@/components/eth-mobile';
import {
  useAccount,
  useDeployedContractInfo,
  useNetwork,
  useScaffoldWriteContract
} from '@/hooks/eth-mobile';
import SnowmanList from '@/modules/home/components/SnowmanList';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { truncateAddress } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { ethers, InterfaceAbi } from 'ethers';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { parseEther } from 'viem';

function HighlightedText({ children }: { children: string }) {
  return (
    <View className="bg-green-100 py-1 rounded-full px-4">
      <Text className="text-center text-lg font-[Poppins]">{children}</Text>
    </View>
  );
}

export default function Home() {
  const toast = useToast();
  const account = useAccount();
  const network = useNetwork();
  const isFocused = useIsFocused();
  const router = useRouter();

  const { data: snowmanContract, isLoading: isLoadingSnowmanContract } =
    useDeployedContractInfo({
      contractName: 'Snowman'
    });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: 'Snowman',
    gasLimit: BigInt('500000')
  });

  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const mint = async () => {
    try {
      setIsMinting(true);
      await writeContractAsync({
        functionName: 'mint',
        value: parseEther('0.02')
      });

      setBalance(balance + 1);
      toast.show('Minted One(1) Snowman☃️', {
        type: 'success',
        placement: 'top'
      });
    } catch (error) {
      toast.show(JSON.stringify(error), { type: 'danger', placement: 'top' });
      console.log('Minting Error: ', error);
    } finally {
      setIsMinting(false);
    }
  };

  const getSnowmanBalance = async () => {
    try {
      if (isLoadingSnowmanContract) return;
      if (!snowmanContract) {
        toast.show('Loading resources', { placement: 'top' });
        return;
      }

      setIsLoadingBalance(true);

      const provider = new ethers.JsonRpcProvider(network.provider);

      const snowman = new ethers.Contract(
        snowmanContract.address,
        snowmanContract.abi as InterfaceAbi,
        provider
      );
      const balance = await snowman.balanceOf(account.address);
      setBalance(Number(balance));
    } catch (error) {
      console.error(error);
      return;
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const refreshBalance = async () => {
    setIsRefreshing(true);
    await getSnowmanBalance();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!isFocused) return;
    getSnowmanBalance();
  }, [account, network, isLoadingSnowmanContract, isFocused]);

  if (!isFocused) return;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshBalance}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View className="flex flex-row items-center justify-between px-4 py-2">
          <Text className="text-2xl font-bold font-[Poppins-Bold]">
            ☃️Snowman
          </Text>

          <View className="flex flex-row items-center gap-x-5">
            <Link href="/debugContracts" push asChild>
              <Ionicons
                name="bug-outline"
                size={Device.getDeviceWidth() * 0.07}
                color="#555"
              />
            </Link>

            <Link href="/wallet" push asChild>
              <Ionicons
                name="wallet-outline"
                size={Device.getDeviceWidth() * 0.07}
                color="#555"
              />
            </Link>

            <Link href="/settings" push asChild>
              <Ionicons
                name="settings-outline"
                size={Device.getDeviceWidth() * 0.07}
                color="#555"
              />
            </Link>
          </View>
        </View>

        <View className="p-8 items-center bg-white">
          <Text className="font-[Poppins] text-base">Do you wanna build a</Text>
          <Text className="font-[Poppins-Medium] text-xl ml-4">Snowman☃️</Text>
          {!!snowmanContract && (
            <CopyableText
              displayText={truncateAddress(snowmanContract.address)}
              value={snowmanContract.address}
              containerStyle={{
                paddingHorizontal: 15,
                paddingVertical: 2,
                backgroundColor: COLORS.primaryLight,
                borderRadius: 24
              }}
              textStyle={{
                fontSize: FONT_SIZE.md,
                fontFamily: 'Poppins-Medium',
                marginBottom: -2,
                color: COLORS.primary
              }}
              iconStyle={{ color: COLORS.primary }}
            />
          )}

          <Text className="text-center mt-4 font-[Poppins] text-base max-w-[70%]">
            Mint a unique Snowman☃️ for{' '}
            <Text style={{ color: COLORS.primary }}>0.02 ETH</Text>
          </Text>

          <View className="flex-row justify-between w-full gap-2.5 mt-2.5">
            <CustomButton
              text="Mint"
              onPress={mint}
              style={{ width: '50%' }}
              loading={isMinting}
            />

            <CustomButton
              text="Accessories"
              type="outline"
              onPress={() => router.push('/closet' as never)}
              style={{ width: '50%' }}
            />
          </View>
        </View>

        {isLoadingBalance && !isRefreshing ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <SnowmanList balance={balance} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
