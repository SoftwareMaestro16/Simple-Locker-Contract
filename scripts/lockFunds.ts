import { toNano, Address } from '@ton/core';
import { Main } from '../wrappers/Main';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const compiledCode = await compile('Main');
    const codeBase64 = compiledCode.toBoc().toString('base64');
    console.log('Base64 encoded contract code:', codeBase64);

    const time = Math.floor(Date.now() / 1000) + 200; // 86400 one day [24h]
    const timeDontRepeatDeploy = 1725719837;

    const main = provider.open(Main.createFromConfig({
        owner: provider.sender().address as Address,
        timeEnd: BigInt(timeDontRepeatDeploy)
    }, await compile('Main')));

    await main.sendLock(provider.sender(), toNano('0.15'));
    await provider.waitForDeploy(main.address);

    console.log('Deploy request sent');
    console.log('Contract deployed at address:', main.address);

}
