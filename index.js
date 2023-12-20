const { TonClient, WalletContractV4, internal } = require("@ton/ton");
const { mnemonicToPrivateKey } = require("@ton/crypto");

// Create Client
const client = new TonClient({
    endpoint:
        "https://ton.access.orbs.network/44A1c0ff5Bd3F8B62C092Ab4D238bEE463E644A1/1/mainnet/toncenter-api-v2/jsonRPC",
});

let mnemonicWords = [
    {
        privateKey:"" 
    },
]

async function btach(mnemonic){
    const mnemonics = mnemonic.privateKey.split(" ");
    let keyPair = await mnemonicToPrivateKey(mnemonics);
    let workchain = 0;
    let wallet = WalletContractV4.create({
        workchain,
        publicKey: keyPair.publicKey,
    });
    let contract = client.open(wallet);

    let v = []

    for (let i = 0; i < 4; i++) {
        v.push(internal({
            to: wallet.address,
            value: "0",
            body: `data:application/json,{"p":"ton-20","op":"mint","tick":"dedust.io","amt":"1000000000"}`
        }))

    }
    let count = 0
 
    for (let i = 0; i < 10000; i++) {
        try {
            let seqno = await contract.getSeqno();
            await contract.sendTransfer({
                seqno: seqno,
                secretKey: keyPair.secretKey,
                validUntil: Math.floor(Date.now() / 1e3) + 600,
                messages: v,
            });
            count++
            console.log(`${wallet.address}:${count}`);
            await sleep(60000)
        } catch (error) {
            console.log(error)
            await sleep(60000)
        }
    }

    console.log("Done");
}


async function main() {
    Promise.all(mnemonicWords.map(mnemonic => btach(mnemonic)))
    .then(() => {
        console.log("END");
    })
    .catch(error => {
        console.error("EEOR: ", error);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();