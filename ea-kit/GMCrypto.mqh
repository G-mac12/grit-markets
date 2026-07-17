//+------------------------------------------------------------------+
//| GMCrypto.mqh — HMAC-SHA256 for Grit Markets telemetry signing    |
//| Part of the Grit Markets EA Integration Kit.                     |
//|                                                                  |
//| Uses MT5's built-in CryptEncode(CRYPT_HASH_SHA256) for the hash  |
//| and composes HMAC per RFC 2104. Verify against the test vector   |
//| in INTEGRATION-GUIDE.md before shipping.                         |
//+------------------------------------------------------------------+
#ifndef GM_CRYPTO_MQH
#define GM_CRYPTO_MQH

// SHA-256 of an arbitrary byte array → 32-byte digest. Returns false on
// failure (should not happen on any modern terminal build).
bool GM_Sha256(const uchar &data[], uchar &digest[])
  {
   uchar key_unused[];       // CryptEncode ignores the key for plain hashes
   ResetLastError();
   int n = CryptEncode(CRYPT_HASH_SHA256, data, key_unused, digest);
   return (n == 32);
  }

// HMAC-SHA256(secret, message) → lowercase hex string.
// Returns "" on failure; callers must treat "" as "do not send".
string GM_HmacSha256Hex(const string message, const string secret)
  {
   const int BLOCK = 64; // SHA-256 block size

   // key bytes (UTF-8, no terminator)
   uchar key[];
   int klen = StringToCharArray(secret, key, 0, WHOLE_ARRAY, CP_UTF8) - 1;
   if(klen < 0) return("");
   ArrayResize(key, klen);

   // keys longer than one block are hashed first
   if(klen > BLOCK)
     {
      uchar kd[];
      if(!GM_Sha256(key, kd)) return("");
      ArrayResize(key, 32);
      ArrayCopy(key, kd, 0, 0, 32);
      klen = 32;
     }

   uchar ipad[], opad[];
   ArrayResize(ipad, BLOCK);
   ArrayResize(opad, BLOCK);
   for(int i = 0; i < BLOCK; i++)
     {
      uchar kb = (i < klen) ? key[i] : (uchar)0;
      ipad[i] = (uchar)(kb ^ 0x36);
      opad[i] = (uchar)(kb ^ 0x5C);
     }

   // inner = H(ipad || message)
   uchar msg[];
   int mlen = StringToCharArray(message, msg, 0, WHOLE_ARRAY, CP_UTF8) - 1;
   if(mlen < 0) mlen = 0;
   uchar inner_in[];
   ArrayResize(inner_in, BLOCK + mlen);
   ArrayCopy(inner_in, ipad, 0, 0, BLOCK);
   if(mlen > 0) ArrayCopy(inner_in, msg, BLOCK, 0, mlen);
   uchar inner[];
   if(!GM_Sha256(inner_in, inner)) return("");

   // outer = H(opad || inner)
   uchar outer_in[];
   ArrayResize(outer_in, BLOCK + 32);
   ArrayCopy(outer_in, opad, 0, 0, BLOCK);
   ArrayCopy(outer_in, inner, BLOCK, 0, 32);
   uchar mac[];
   if(!GM_Sha256(outer_in, mac)) return("");

   // lowercase hex
   string hex = "";
   for(int i = 0; i < 32; i++)
      hex += StringFormat("%02x", mac[i]);
   return(hex);
  }

#endif // GM_CRYPTO_MQH
