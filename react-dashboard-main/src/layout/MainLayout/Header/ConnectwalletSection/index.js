import React, { useEffect } from 'react';
import { useWeb3React } from "@web3-react/core";
import { injected } from "./connector";
import { Flex } from "./CommonComponents";

import { Button } from '@material-ui/core';
import './walletconnect.styles.scss';


var isConfirm = false

const WalletConnect = () => {
  const { account, activate, deactivate, error, active, chainId } = useWeb3React();
  const handleLogin = () => {
      isConfirm = true
      localStorage.setItem("accountStatus", "1");
      return activate(injected)
  }

  const handleLogout = () => {
      isConfirm = false
      localStorage.removeItem("accountStatus")
      deactivate()
  }

  function copyToClipBoard() {
      var x = document.getElementById("snackbar");
      x.className = "show";
      setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
  }

  useEffect(() => {
      if (!chainId && isConfirm) {
          const { ethereum } = window;
          (async () => {
              try {
                  await ethereum.request({
                      method: "wallet_switchEthereumChain",
                      params: [{ chainId: "0xA869" }],
                  });
              } catch (switchError) {
                  if (switchError.code === 4902) {
                      try {
                          await ethereum.request({
                              method: "wallet_addEthereumChain",
                              params: [
                                  {
                                      chainId: "0xA869",
                                      chainName: "Avalanche Testnet C-Chain",
                                      nativeCurrency: {
                                          name: "Avalanche",
                                          symbol: "AVAX",
                                          decimals: 18,
                                      },
                                      rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                                      blockExplorerUrls: ["https://testnet.snowtrace.io/"],
                                  },
                              ],
                          });
                      } catch (addError) {
                          console.error(addError);
                      }
                  }
              }
              activate(injected);
          })();
          isConfirm = false;
      }
  }, [account, error, active, chainId, activate ]);

  useEffect(() => {
      if (!active && localStorage.getItem("accountStatus")) {
          activate(injected);
      }
  }, [ active, activate])

  return (
    <div className='cart-container'>
      {!account ? (
          <Button variant="contained" className="animateButton" onClick={handleLogin}>Connect Wallet</Button>
      ) : (
          <Flex>
              <Button variant="contained" className="animateButton mr-10" onClick={() => {
                  navigator.clipboard.writeText(account)
                  copyToClipBoard()
              }}>{account.slice(0, 5)}...{account.slice(-5)}</Button>
              <Button variant="contained" className="animateButton" onClick={handleLogout}>disconnect</Button>
              <span id="snackbar">Copied Wallet Address!</span>
          </Flex>
      )}
    </div>
  );
}

export default WalletConnect;