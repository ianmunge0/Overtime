import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useColorScheme } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { AntDesign } from '@expo/vector-icons';
import '@walletconnect/react-native-compat'
import { useAccount } from 'wagmi'
import { useQuery, gql } from '@apollo/client';

const QUERY = gql`
  query ($id: ID!, $idt: ID!) {
    account(id: $id) {
      outflows(where: {currentFlowRate_gt: "0", token_: {id: $idt}}) {
        currentFlowRate
        receiver {
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

function Outgoing() {
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
  const { loading, error, data, startPolling, refetch } = useQuery(QUERY, { 
    variables: { id: address == undefined ? "" : address.toLowerCase(), idt: cusdx } 
  });
  if (error) {return;}
  if (loading) {return;}
  //--------

  let nostreamarr = [{nostreammsg: "No Outgoing Stream"}];

  return (
    <>
    {address == undefined ?
      (<></>)
    : 
      (data.account == null ?
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
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <Text style={{color: isDarkMode ? Colors.white : "#686C80", fontSize: 18, fontWeight: '400', lineHeight: 26}}>{nostreamarr[index].nostreammsg}</Text>
              </View>
            )
          }}/>
      :
        <FlatList
          data={data.account.outflows}
          refreshControl={
            <RefreshControl
              colors={["#15D828"]}
              refreshing={refreshing}
              onRefresh={() => setRefreshing(true)}/>
          }
          renderItem={({outflow, index}) => {
            let namedisplay = data.account.outflows[index].receiver.id.startsWith("0x") ? data.account.outflows[index].receiver.id.substring(0, 6)+"..."+data.account.outflows[index].receiver.id.substring(38) : data.account.outflows[index].receiver.id;
            let elapsed = ((new Date().getTime()/1000) - data.account.outflows[index].createdAtTimestamp)/3600;
            let difftime = (new Date().getTime()/1000) - data.account.outflows[index].updatedAtTimestamp;
            let numstreamed = ((Number(data.account.outflows[index].currentFlowRate) * difftime) / 1000000000000000000) + (Number(data.account.outflows[index].streamedUntilUpdatedAt) / 1000000000000000000);
            return(
              <TouchableOpacity
                style={{
                  paddingVertical: 18,
                  flexDirection: 'row',
                  flex: 3,
                  alignItems: 'center'
                }}
                onPress={() => navigation.navigate('SingleStream', {type: 'outgoing', name: data.account.outflows[index].receiver.id, elapsed: elapsed, streamed: numstreamed, rate: data.account.outflows[index].currentFlowRate, started: data.account.outflows[index].createdAtTimestamp, url: data.account.outflows[index].flowUpdatedEvents[0].transactionHash, updatedattimestamp: data.account.outflows[index].updatedAtTimestamp, streameduntilupdatedat: data.account.outflows[index].streamedUntilUpdatedAt})}>
                <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{width: 48, height: 48, backgroundColor: '#E7E7E7', borderRadius: 32, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: '#989CB0', fontSize: 24, fontFamily: 'Rubik', fontWeight: '600'}}>{data.account.outflows[index].receiver.id.charAt(0)}</Text>
                  </View>
                </View>
                <View style={{flex: 1.3, flexDirection: 'column'}}>
                  <Text style={{color: isDarkMode ? Colors.white : "#686C80", fontSize: 18, fontFamily: 'Rubik', fontWeight: '400', lineHeight: 26}}>{namedisplay}</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{color: '#15D828', fontSize: 14, fontFamily: 'Rubik', fontWeight: '300', lineHeight: 18}}>{elapsed.toString().length > 5 ? elapsed.toString().substring(0, 5)+"..." : elapsed} hr(s)</Text>
                  </View>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{color: '#15D828', fontSize: 15, fontFamily: 'Rubik', fontWeight: '500'}}>{numstreamed.toString().length > 5 ? numstreamed.toString().substring(0, 5)+"..." : numstreamed}</Text>
                  <Text style={{color: isDarkMode ? Colors.white : "#686C80", fontSize: 15, fontFamily: 'Rubik', fontWeight: '500'}}>cUSDx</Text>
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
        right: 32,
        bottom: 44,
        width: 54,
        height: 54,
        borderRadius: 9999,
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#15D828',
        elevation: 10
      }}
      onPress={() => navigation.navigate('CreateStream')}>
      <AntDesign name="plus" size={30} color="white" />
    </TouchableOpacity>
    </>
  );
};

export default Outgoing;