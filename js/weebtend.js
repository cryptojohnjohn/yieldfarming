$(function() {
    consoleInit();
    start(main);
});

async function main() {

    const App = await init_ethers();

    _print(`Initialized ${App.YOUR_ADDRESS}`);
    _print("Reading smart contracts...");

    const WEEBTEND_TOKEN = new ethers.Contract(WEEBTEND_TOKEN_ADDR, WEEBTEND_TOKEN_ABI, App.provider);
    const TEND_TOKEN = new ethers.Contract(TEND_ADDR, ERC20_ABI, App.provider);

    const currentTEND = await TEND_TOKEN.balanceOf(App.YOUR_ADDRESS);
    const currentWeebTEND = await WEEBTEND_TOKEN.balanceOf(App.YOUR_ADDRESS);

    _print("Finished reading smart contracts... Looking up prices... \n")

    // Look up prices
    const prices = await lookUpPrices(["tendies"]);
    const TENDprice = prices.tendies.usd;
    const weebTENDprice = '-1';

    // Finished. Start printing

    _print("========== PRICES ==========")
    _print(`1 TEND  = $${TENDprice}`);
    _print(`1 weebTEND  = $${weebTENDprice}`);
    
    const approveTENDAndMint = async function () {

        const signer = App.provider.getSigner();

        const WEEBTEND_TOKEN = new ethers.Contract(WEEBTEND_TOKEN_ADDR, WEEBTEND_TOKEN_ABI, App.provider, signer);
        const TEND_TOKEN = new ethers.Contract(TEND_ADDR, ERC20_ABI, App.provider, signer);

        const currentTEND = await TEND_TOKEN.balanceOf(App.YOUR_ADDRESS);
        const allowedTEND = await TEND_TOKEN.allowance(App.YOUR_ADDRESS, WEEBTEND_TOKEN);

        console.log(allowedTEND);

        let allow = Promise.resolve();

        if (allowedTEND < currentTEND) {
            allow = TEND_TOKEN.increaseAllowance(WEEBTEND_TOKEN, currentTEND.sub(allowedTEND), {gasLimit: 50000})
                .then(function(t) {
                    return App.provider.waitForTransaction(t.hash);
                });
        }

        if (currentYFI > 0) {
            allow.then(function() {
                WEEBTEND_TOKEN.mint(currentYFI)
            });
        } else {
            alert("You have no TEND!!");
        }
    }

    const burnWeebTEND = async function () {

        const signer = App.provider.getSigner();

        const WEEBTEND_TOKEN = new ethers.Contract(WEEBTEND_TOKEN_ADDR, WEEBTEND_TOKEN_ABI, App.provider, signer);

        const currentWeebTEND = await TEND_TOKEN.balanceOf(App.YOUR_ADDRESS);

        if (currentWeebTEND > 0) {
            WEEBTEND_TOKEN.burn(currentWeebTEND)
        } else {
            alert("You have no weebTEND!!");
        }
    }    

    _print_link(`Stake ${toFixed(currentTEND / 1e18, 4)} TEND in your wallet`, approveTENDAndMint);
    _print_link(`Burn ${toFixed(currentWeebTEND / 1e18, 4)} weebTEND in your wallet`, burnWeebTEND);
}