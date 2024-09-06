import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Main } from '../wrappers/Main';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Main', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Main');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let main: SandboxContract<Main>;
    let owner: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');
        user = await blockchain.treasury('user');

        main = blockchain.openContract(Main.createFromConfig({
            owner: owner.address
        }, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await main.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: main.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // to deploy
    });

    it('should lock funds for admin & random user', async() => {
        const sendLockOwnerResult = await main.sendLock
            (owner.getSender(), toNano("1"));
            
        expect(sendLockOwnerResult.transactions).toHaveTransaction({
            from: owner.address,
            to: main.address,
            success: true,
            op: 0x41c17dd4,
            value: toNano("1")
        });

        const sendLockUserResult = await main.sendLock
            (user.getSender(), toNano("1"));
            
        expect(sendLockUserResult.transactions).toHaveTransaction({
            from: user.address,
            to: main.address,
            success: false,
            outMessagesCount: 1,
            op: 0x41c17dd4,
            value: toNano("1"),
            exitCode: 401
        });
    });

    it('should unlock funds for admin & random user', async() => {
        const sendUnlockOwnerResult = await main.sendUnlock
            (owner.getSender(), toNano("0.02"));
            
        expect(sendUnlockOwnerResult.transactions).toHaveTransaction({
            from: owner.address,
            to: main.address,
            success: true,
            outMessagesCount: 1,
            op: 0x67d59817,
            value: toNano("0.02")
        });

        const sendUnlockUserResult = await main.sendUnlock
            (user.getSender(), toNano("0.02"));
            
        expect(sendUnlockUserResult.transactions).toHaveTransaction({
            from: user.address,
            to: main.address,
            success: false,
            outMessagesCount: 1,
            op: 0x67d59817,
            value: toNano("0.02"),
            exitCode: 401
        });
    });

    it('should emergency withdrawal funds for admin & random user', async() => {
        const sendEmergencyWithdrawalOwnerResult = await main.sendEmergencyWithdrawal
            (owner.getSender(), toNano("0.02"));
            
        expect(sendEmergencyWithdrawalOwnerResult.transactions).toHaveTransaction({
            from: owner.address,
            to: main.address,
            success: true,
            outMessagesCount: 2,
            op: 0x79396598,
            value: toNano("0.02")
        });

        const sendEmergencyWithdrawalUserResult = await main.sendEmergencyWithdrawal
            (user.getSender(), toNano("0.02"));
            
        expect(sendEmergencyWithdrawalUserResult.transactions).toHaveTransaction({
            from: user.address,
            to: main.address,
            success: false,
            op: 0x79396598,
            value: toNano("0.02"),
            exitCode: 401
        });
    });
});
