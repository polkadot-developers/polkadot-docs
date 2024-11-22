<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>ts-node relayToSystem.ts</span>
    <br>
	<span data-ty>Call data:</span>
	<span data-ty>{</span>
	<span data-ty>    "origin": "westend",</span>
	<span data-ty>    "dest": "westmint",</span>
	<span data-ty>    "direction": "RelayToSystem",</span>
	<span data-ty>    "xcmVersion": 3,</span>
	<span data-ty>    "method": "transferAssets",</span>
	<span data-ty>    "format": "call",</span>
	<span data-ty>    "tx": "0x630b03000100a10f03000101006c0c32faf970eacb2d4d8e538ac0dab3642492561a1be6f241c645876c056c1d030400000000070010a5d4e80000000000"</span>
	<span data-ty>}</span>
	<span data-ty></span>
	<span data-ty>Decoded tx:</span>
	<span data-ty>{</span>
	<span data-ty>    "args": {</span>
	<span data-ty>        "dest": {</span>
	<span data-ty>            "V3": {</span>
	<span data-ty>                "parents": "0",</span>
	<span data-ty>                "interior": {</span>
	<span data-ty>                    "X1": {</span>
	<span data-ty>                        "Parachain": "1,000"</span>
	<span data-ty>                    }</span>
	<span data-ty>                }</span>
	<span data-ty>            }</span>
	<span data-ty>        },</span>
	<span data-ty>        "beneficiary": {</span>
	<span data-ty>            "V3": {</span>
	<span data-ty>                "parents": "0",</span>
	<span data-ty>                "interior": {</span>
	<span data-ty>                    "X1": {</span>
	<span data-ty>                        "AccountId32": {</span>
	<span data-ty>                            "network": null,</span>
	<span data-ty>                            "id": "0x6c0c32faf970eacb2d4d8e538ac0dab3642492561a1be6f241c645876c056c1d"</span>
	<span data-ty>                        }</span>
	<span data-ty>                    }</span>
	<span data-ty>                }</span>
	<span data-ty>            }</span>
	<span data-ty>        },</span>
	<span data-ty>        "assets": {</span>
	<span data-ty>            "V3": [</span>
	<span data-ty>                {</span>
	<span data-ty>                    "id": {</span>
	<span data-ty>                        "Concrete": {</span>
	<span data-ty>                            "parents": "0",</span>
	<span data-ty>                            "interior": "Here"</span>
	<span data-ty>                        }</span>
	<span data-ty>                    },</span>
	<span data-ty>                    "fun": {</span>
	<span data-ty>                        "Fungible": "1,000,000,000,000"</span>
	<span data-ty>                    }</span>
	<span data-ty>                }</span>
	<span data-ty>            ]</span>
	<span data-ty>        },</span>
	<span data-ty>        "fee_asset_item": "0",</span>
	<span data-ty>        "weight_limit": "Unlimited"</span>
	<span data-ty>    },</span>
	<span data-ty>    "method": "transferAssets",</span>
	<span data-ty>    "section": "xcmPallet"</span>
	<span data-ty>}</span>
</div>