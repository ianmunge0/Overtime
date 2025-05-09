import React, {useState, useEffect} from 'react';
import { Text, View, FlatList, TouchableOpacity, RefreshControl, useColorScheme } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useQuery, gql } from '@apollo/client';
import '@walletconnect/react-native-compat'
import { useAccount } from 'wagmi'
import AmountStreamedTemp from '../AmountStreamedTemp';
import Elapsed from '../Elapsed';

const QUERY = gql`
  query ($id: ID!, $idt: ID!) {
    account(id: $id) {
      inflows(where: {currentFlowRate_gt: "0", token_: {id: $idt}}) {
        id
        currentFlowRate
        sender {
          id
        }
        createdAtTimestamp
        streamedUntilUpdatedAt
        flowUpdatedEvents(first: 1, skip: 0, orderBy: timestamp) {
          transactionHash
        }
        updatedAtTimestamp
      }
    }
  }
`;

export default function Incoming() {
  const { address } = useAccount();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (refreshing == true) {
      refetch();
      setRefreshing(false);
    }
  }, [refreshing])

  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';

  //--------
  var cusdx = "0x3acb9a08697b6db4cd977e8ab42b6f24722e6d6e";
  const { loading, error, data, refetch } = useQuery(QUERY, { 
    variables: { id: address == undefined ? "" : address.toLowerCase(), idt: cusdx },
    pollInterval: 500
  });
  if (error) {return;}
  if (loading) {return;}
  //--------
  let nostreamarr = [{nostreammsg: "No Incoming Stream"}];

  return (
    <>
    {
      data.account == null ?
        (
          <FlatList
            data={nostreamarr}
            contentContainerStyle={{alignItems: 'center', justifyContent: 'center', flex: 1}}
            refreshControl={
              <RefreshControl
                colors={["#15D828"]}
                refreshing={refreshing}
                onRefresh={() => setRefreshing(true)}/>
            }
            renderItem={({nostreamobj, index}) => {
              return(
                <View>
                  <Text style={{color: isDarkMode ? Colors.white : "#686C80", fontSize: 18, fontWeight: '400', lineHeight: 26}}>{nostreamarr[index].nostreammsg}</Text>
                </View>
              )
            }}
          />
        )
      :
        (
          data.account.inflows.length == 0 || data.account == null ?
            <FlatList
              data={nostreamarr}
              contentContainerStyle={{alignItems: 'center', justifyContent: 'center', flex: 1}}
              refreshControl={
                <RefreshControl
                  colors={["#15D828"]}
                  refreshing={refreshing}
                  onRefresh={() => setRefreshing(true)}/>
              }
              renderItem={({nostreamobj, index}) => {
                return(
                  <View>
                    <Text style={{color: isDarkMode ? Colors.white : "#686C80", fontSize: 18, fontWeight: '400', lineHeight: 26}}>{nostreamarr[index].nostreammsg}</Text>
                  </View>
                )
              }}
            />
          :
            <FlatList
              data={data.account.inflows}
              refreshControl={
                <RefreshControl
                  colors={["#15D828"]}
                  refreshing={refreshing}
                  onRefresh={() => setRefreshing(true)}/>
              }
              renderItem={({inflow, index}) => {
                let namedisplay = data.account.inflows[index].sender.id.startsWith("0x") ? data.account.inflows[index].sender.id.substring(0, 6)+"..."+data.account.inflows[index].sender.id.substring(38) : data.account.inflows[index].sender.id;
                return(
                  <TouchableOpacity
                    style={{
                      paddingVertical: 18,
                      flexDirection: 'row',
                      flex: 3,
                      alignItems: 'center'
                    }}
                    onPress={() => {
                      navigation.navigate('SingleStream', {
                        type: 'incoming',
                        flowid: data.account.inflows[index].id,
                        name: data.account.inflows[index].sender.id,
                        rate: data.account.inflows[index].currentFlowRate,
                        started: data.account.inflows[index].createdAtTimestamp,
                        url: data.account.inflows[index].flowUpdatedEvents[0].transactionHash,
                        streameduntilupdatedat: data.account.inflows[index].streamedUntilUpdatedAt,
                        updatedattimestamp: data.account.inflows[index].updatedAtTimestamp
                      })
                    }}
                    >
                    <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{width: 48, height: 48, backgroundColor: '#E7E7E7', borderRadius: 32, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color: '#989CB0', fontSize: 24, fontFamily: 'Rubik', fontWeight: '600'}}>{data.account.inflows[index].sender.id.charAt(0)}</Text>
                      </View>
                    </View>
                    <View style={{flex: 1.3, flexDirection: 'column'}}>
                      <Text style={{color: isDarkMode ? Colors.white : "#686C80", fontSize: 18, lineHeight: 26}}>{namedisplay}</Text>
                      <Elapsed started={data.account.inflows[index].createdAtTimestamp} inlistview={true}/>
                    </View>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <AmountStreamedTemp
                        rate={data.account.inflows[index].currentFlowRate}
                        updatedattimestamp={data.account.inflows[index].updatedAtTimestamp}
                        streameduntilupdatedat={data.account.inflows[index].streamedUntilUpdatedAt}
                        inlistview={true}/>
                      <Text style={{color: isDarkMode ? Colors.white : "#686C80", fontSize: 15}}>cUSDx</Text>
                    </View>
                  </TouchableOpacity>
                )
              }}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#ececec'}}></View>}
              ListFooterComponent={() => <View style={{ height: 75}}/>}/>
        )
    }
    <TouchableOpacity 
      style={{
        bottom: 44,
        right: 32,
        padding: 10,
        borderRadius: 15,
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#15D828',
        elevation: 10
      }}
      onPress={() => navigation.navigate('Unwrap')}>
      <Text style={{color: 'white', fontSize: 17}}>Retrieve</Text>
    </TouchableOpacity>
    </>
  );
};