/**
  * @author Marzavec
  * @summary Finalize a siw
  * @version 1.0.0
  * @description Finalize a siw, check for NFT ownership, and sync permissions
  * @module signsiw
  */

import nacl from 'tweetnacl';
import bs58 from 'bs58';

import {
  Info,
} from '../utility/_Constants.js';

/**
  * Executes when invoked by a remote client
  * @param {Object} env - Enviroment object with references to core, server, socket & payload
  * @public
  * @return {void}
  */
export async function run({
  server, socket, payload,
}) {
  // must be in a channel to run this command
  if (typeof socket.channel === 'undefined') {
    return server.police.frisk(socket, 1);
  }

  if (typeof socket.siwMsg === 'undefined' || typeof socket.siwAddress === 'undefined') {
    return false;
  }

  if (typeof payload.signature !== 'string' || typeof payload.signedMessage !== 'string') {
    return false;
  }

  if (payload.signedMessage !== socket.siwMsg) {
    return false;
  }

  const now = new Date();
  if (!socket.siwExpiry || socket.siwExpiry < now) {
    return false;
  }

  const tempSiwAddress = socket.siwAddress;

  socket.siwMsg = undefined;
  socket.siwAddress = undefined;
  socket.siwExpiry = undefined;

  const messageBytes = new TextEncoder().encode(payload.signedMessage);
  const publicKeyBytes = bs58.decode(tempSiwAddress);
  const signatureBytes = bs58.decode(payload.signature);

  let isVerified = false;
  try {
    isVerified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );
  } catch (e) {
    return false;
  }

  if (isVerified) {
    socket.wallet = {};
    socket.wallet.address = tempSiwAddress;

    return server.reply({
      cmd: 'info',
      text: `Now connected to: ${tempSiwAddress}`,
      id: Info.Wallet.CONNECTED,
      channel: socket.channel,
    }, socket);
  }

  return false;
}

/**
  * The following payload properties are required to invoke this module:
  * "signature", "signedMessage"
  * @public
  * @typedef {Array} signsiw/requiredData
  */
export const requiredData = ['signature', 'signedMessage'];

/**
  * Module meta information
  * @public
  * @typedef {Object} signsiw/info
  * @property {string} name - Module command name
  * @property {string} category - Module category name
  * @property {string} description - Information about module
  * @property {string} usage - Information about module usage
  */
export const info = {
  name: 'signsiw',
  category: 'wallet',
  description: 'Verifies the wallet signature and connects the wallet to the socket',
  usage: `
    API: { cmd: 'signsiw', signature: '<base58 signature>', signedMessage: '<original text>' }`,
};
