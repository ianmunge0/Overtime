import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  useColorScheme,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { AntDesign } from '@expo/vector-icons';
import { useAccount } from 'wagmi'
import "react-native-get-random-values"
import "@ethersproject/shims"
import { ethers } from 'ethers'
import {celo} from 'viem/chains'
import { Framework } from '@superfluid-finance/sdk-core'
import Wrap from './Wrap';

function FloatingLabelInput({label, value, onchangetext, margintop, keyboardtype, numUI}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const isDarkMode = useColorScheme() === 'dark';

  const fli = { paddingTop: 18, marginTop: margintop, borderBottomColor: isFocused ? "#15D828" : (isDarkMode ? Colors.light : Colors.dark), borderBottomWidth: 1, flexDirection: 'row', width: numUI == 1 ? '60%' : '100%' }

  const labelStyle = {
    position: 'absolute',
    left: 0,
    top: isFocused || value != '' ? 0 : 18,
    fontSize: isFocused || value != '' ? 14 : 20,
    color: isFocused ? "#15D828" : (isDarkMode ? Colors.light : "#989CB0")
  };
  const textinputstyle = { 
    height: 26,
    fontSize: 20,
    color: isDarkMode ? Colors.white : Colors.black,
    width: '100%'
  }
  
  return (
    <View style={{flexDirection: 'row'}}>
      <View style={fli}>
        <Text style={labelStyle}>
          {label}
        </Text>
        <TextInput
          onChangeText={onchangetext}
          style={textinputstyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          keyboardType={keyboardtype}
        />
      </View>
      {numUI == 1 ? <View style={{width: '10%'}}><Text style={{position: 'absolute', bottom: 0, fontSize: 20, alignSelf: 'center', color: isDarkMode ? Colors.light : Colors.black}}>/</Text></View> : <></>}
      {numUI == 1 ? <View style={{width: '30%'}}><Text style={{position: 'absolute', bottom: 0, fontSize: 20, color: isDarkMode ? Colors.light : Colors.black}}>hour</Text></View> : <></>}
    </View>
  );
}

export default function CreateStream({connectionprop, setdisabled, disabled, setrefreshoutgoing, setcreatingstream, creatingstream}) {
  const [receiver, setReceiver] = useState('');
  const [rate, setRate] = useState('');
  //-------
  const [balance, setBalance] = useState('--');
  const [modalVisible, setModalVisible] = useState(false);
  //-------

  const { address, connector } = useAccount()
  const provider = address == undefined ? undefined : connector._provider;
  const web3Provider = useMemo(
    () =>
        provider ? new ethers.providers.Web3Provider(provider, celo.id) : undefined,
    [provider]
  )

  async function hourrate(rate){
    var rateweips = (rate * 1000000000000000000) / 3600
    return Math.ceil(rateweips).toString()
  }

  async function createflow(receiver, rate) {
    try {
      if (provider != undefined) {
        const sf = await Framework.create({
          chainId: celo.id,
          provider: web3Provider
        });
        const ratestr = await hourrate(rate)

        const signer = web3Provider.getSigner();
        const cusdx = await sf.loadSuperToken("cUSDx");
        
        const createflow = cusdx.createFlow({
          sender: address,
          receiver: receiver,
          flowRate: ratestr
        });
        await createflow.exec(signer)
        .then(() => {
          setReceiver('');
        });
      }
    }
    catch (error) {}
  }

  //-------
  function useInterval(callback, delay) {
    const savedCallback = useRef();
   
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
   
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }
  //-------

  //-------
  async function checkbalance() {
    try {
      if (provider != undefined) {
        const sf = await Framework.create({
          chainId: celo.id,
          provider: web3Provider
        });

        const signer = web3Provider.getSigner();
        const cusdx = await sf.loadSuperToken("cUSDx");
        
        var balancewei = await cusdx.balanceOf({
          account: address,
          providerOrSigner: signer
        })
        
        var balancecusdx = (Number(balancewei) / 1000000000) / 1000000000
        setBalance(balancecusdx+" cUSDx")
      }
    }
    catch (error) {}
  }
  //-------

  useEffect(() => {
    checkbalance()
  }, [])

  useEffect(() => {
    if (address == undefined) {
      connectionprop(true)
    }
  }, [address])

  useEffect(() => {
    if (disabled == true) {
      setcreatingstream(true)
    }
  }, [disabled])

  useEffect(() => {
    if (creatingstream == true) {
      createflow(receiver, rate)
    }
  }, [creatingstream])

  useEffect(() => {
    if (receiver == '' && creatingstream == true) {
      setRate('');
    }
  }, [receiver])

  useEffect(() => {
    if (receiver == '' && rate == '' && creatingstream == true) {
      //setrefreshoutgoing(true);
      setcreatingstream(false)
    }
  }, [rate])

  //-------
  useInterval(() => {
    checkbalance()
  }, 5000)
  //-------

  const receiverChange = (newText) => setReceiver(newText);
  const rateChange = (newText) => setRate(newText);

  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView style={{ flex: 1, flexDirection: 'column', padding: 30, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}>
      <FloatingLabelInput
        label="Address"
        value={receiver}
        onchangetext={receiverChange}
        margintop={18}
        keyboardtype="default"
        numUI={0}
      />
      <FloatingLabelInput
        label="Rate"
        value={rate}
        onchangetext={rateChange}
        margintop={50}
        keyboardtype="numeric"
        numUI={1}
      />
      <Wrap modalVisible={modalVisible} setModalVisible={setModalVisible}/>
      <View style={{flexDirection: 'row', marginTop: 35, width: '100%'}}>
        <View style={{width: '60%', alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: isDarkMode ? Colors.white : Colors.black}}>{balance}</Text>
        </View>
        <View style={{width: '40%', alignItems: 'center', justifyContent: 'center'}}>
          <TouchableOpacity
            style={{borderColor: '#15D828', flexDirection: 'row', borderRadius: 20, borderWidth: 2, padding: 5}}
            onPress={() => setModalVisible(true)}>
            <AntDesign name="plus" size={20} color="#15D828" style={{fontWeight: '700'}} />
            <Text style={{fontWeight: '700', color: '#15D828', marginLeft: 3, marginRight: 11}}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={{ marginTop: 40, alignSelf: 'center', width: 190, height: 40, backgroundColor: '#15D828', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
        disabled={disabled}
        onPress={() => setdisabled(true)}>
        <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>STREAM</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
