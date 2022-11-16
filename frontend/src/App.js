import abi from "./utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import styles from "./styles/Home.module.css";

function App() {
  // Contract Address & ABI
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  const [ownerAddr, setOwnerAddr] = useState("");

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);
        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const buyLargeCofee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your LARGE coffee!",
          { value: ethers.utils.parseEther("0.01") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);
        console.log("LARGE coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch name and address of owner.
  const getOwnerInfo = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        console.log("contract object retrieved, fetching owner details now...");
        let ownerAddr = await buyMeACoffee.owner();
        let ownerName = await buyMeACoffee.name();
        console.log("ownerAddr:", ownerAddr);
        console.log("ownerName:", ownerName);
        setOwnerName(ownerName);
        setOwnerAddr(ownerAddr);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();
    getOwnerInfo();

    // Create an event handler function for when someone sends us a new memo.
    const onNewMemo = (from, timestamp, name, message, isLargeCoffee) => {
      console.log(
        "Memo received: ",
        from,
        timestamp,
        name,
        message,
        isLargeCoffee
      );
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
          isLargeCoffee,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.imageborder}>
          <img src="lazy-cats-cafe.jpeg" width="700"></img>
        </div>
        <br />
        <br />
        <h1 className={styles.title}>Buy {ownerName} a Coffee!</h1>
        <h3>you'll be donating to {ownerAddr}</h3>

        {currentAccount ? (
          <div className={styles.form}>
            <form>
              <div class="formgroup">
                <label>Name</label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div class="formgroup">
                <label>Send me a message</label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                ></textarea>
              </div>
              <div>
                <button
                  className={styles.swagbutton}
                  type="button"
                  onClick={buyCoffee}
                >
                  Send 1 Coffee for 0.001ETH
                </button>
              </div>
              <div>
                <button
                  className={styles.swagbutton}
                  type="button"
                  onClick={buyLargeCofee}
                >
                  Send 1 LARGE Coffee for 0.01ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button className={styles.swagbutton} onClick={connectWallet}>
            {" "}
            Connect your wallet{" "}
          </button>
        )}
      </main>

      {currentAccount && <h1 className={styles.title}>Memos received</h1>}

      {currentAccount &&
        memos.map((memo, idx) => {
          if (memo.isLargeCoffee) {
            return (
              <div
                key={idx}
                style={{
                  border: "2px solid",
                  width: "600px",
                  height: "80px",
                  padding: "5px",
                  margin: "5px",
                }}
              >
                <p style={{ "font-weight": "bold" }}>"{memo.message}"</p>
                <p>
                  From: {memo.name} at {memo.timestamp.toString()}
                </p>
              </div>
            );
          } else {
            return (
              <div
                key={idx}
                style={{
                  border: "4px solid",
                  width: "600px",
                  height: "120px",
                  padding: "5px",
                  margin: "5px",
                  color: "red",
                }}
              >
                <p style={{ "font-weight": "bold" }}>"{memo.message}"</p>
                <p>
                  From: {memo.name} at {memo.timestamp.toString()}
                </p>
                <p style={{ "font-size": "1" }}>Large Coffee!!</p>
              </div>
            );
          }
        })}
    </div>
  );
}

export default App;
