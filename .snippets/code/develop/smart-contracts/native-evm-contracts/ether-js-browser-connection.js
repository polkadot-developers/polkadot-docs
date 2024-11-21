import { BrowserProvider } from 'ethers';

// Browser wallet will inject the ethereum object into the window object
if (typeof window.ethereum == 'undefined') {
  return console.log('No wallet installed');
}

console.log('An Ethereum wallet is installed!');
const provider = new BrowserProvider(window.ethereum);
