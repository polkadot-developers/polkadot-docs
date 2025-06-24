import { compile } from '@parity/resolc';
import { readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

const compileContract = async (
  solidityFilePath: string,
  outputDir: string
): Promise<void> => {
  try {
    // Read the Solidity file
    const source: string = readFileSync(solidityFilePath, 'utf8');

    // Construct the input object for the compiler
    const input: Record<string, { content: string }> = {
      [basename(solidityFilePath)]: { content: source },
    };

    console.log(`Compiling contract: ${basename(solidityFilePath)}...`);

    // Compile the contract
    const out = await compile(input);

    for (const contracts of Object.values(out.contracts)) {
      for (const [name, contract] of Object.entries(contracts)) {
        console.log(`Compiled contract: ${name}`);

        // Write the ABI
        const abiPath = join(outputDir, `${name}.json`);
        writeFileSync(abiPath, JSON.stringify(contract.abi, null, 2));
        console.log(`ABI saved to ${abiPath}`);

        // Write the bytecode
        if (
          contract.evm &&
          contract.evm.bytecode &&
          contract.evm.bytecode.object
        ) {
          const bytecodePath = join(outputDir, `${name}.polkavm`);
          writeFileSync(
            bytecodePath,
            Buffer.from(contract.evm.bytecode.object, 'hex')
          );
          console.log(`Bytecode saved to ${bytecodePath}`);
        } else {
          console.warn(`No bytecode found for contract: ${name}`);
        }
      }
    }
  } catch (error) {
    console.error('Error compiling contracts:', error);
  }
};

const solidityFilePath: string = './contracts/Storage.sol';
const outputDir: string = './artifacts/';

compileContract(solidityFilePath, outputDir);