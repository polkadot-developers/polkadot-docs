import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('StorageModule', (m) => {
  const storage = m.contract('Storage');
  return { storage };
});
