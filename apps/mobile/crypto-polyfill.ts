import * as Crypto from "expo-crypto";

global.crypto = {
  randomUUID: Crypto.randomUUID,
};
