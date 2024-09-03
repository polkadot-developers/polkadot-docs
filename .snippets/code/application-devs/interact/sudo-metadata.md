```json
{
  "name": "Sudo",        // name of the pallet
  "storage": {           // storage information for the pallet
      "prefix": "Sudo",  // database prefix for the pallet storage items
      "entries": [
        {
          "name": "Key",
          "modifier": "Optional",
          "ty": {
             "Plain": 0
          },
          "default": [
             0
          ],
          "docs": [
             "The `AccountId` of the sudo key."
          ]
        }
      ]
  },
  "calls": {       // pallet call types
      "ty": 117    // type identifier in the types section
  },
  "event": {       // pallet event types
      "ty": 42     // type identifier in the types section
  },
  "constants": [], // pallet constants
  "error": {       // pallet error types
      "ty": 124    // type identifier in the types section
          },
  "index": 8       // index identifier for the pallet in the runtime
},
```