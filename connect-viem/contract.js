export const myContract = {
	abi: [
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "message_",
						"type": "string"
					}
				],
				"stateMutability": "nonpayable",
				"type": "constructor"
			},
			{
				"inputs": [],
				"name": "get_message",
				"outputs": [
					{
						"internalType": "string",
						"name": "",
						"type": "string"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "message_",
						"type": "string"
					}
				],
				"name": "set_message",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			}
],

bytecode: "608060405234801561000f575f5ffd5b50604051610af8380380610af883398181016040528101906100319190610193565b805f908161003f91906103ea565b50506104b9565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6100a58261005f565b810181811067ffffffffffffffff821117156100c4576100c361006f565b5b80604052505050565b5f6100d6610046565b90506100e2828261009c565b919050565b5f67ffffffffffffffff8211156101015761010061006f565b5b61010a8261005f565b9050602081019050919050565b8281835e5f83830152505050565b5f610137610132846100e7565b6100cd565b9050828152602081018484840111156101535761015261005b565b5b61015e848285610117565b509392505050565b5f82601f83011261017a57610179610057565b5b815161018a848260208601610125565b91505092915050565b5f602082840312156101a8576101a761004f565b5b5f82015167ffffffffffffffff8111156101c5576101c4610053565b5b6101d184828501610166565b91505092915050565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061022857607f821691505b60208210810361023b5761023a6101e4565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f6008830261029d7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610262565b6102a78683610262565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f6102eb6102e66102e1846102bf565b6102c8565b6102bf565b9050919050565b5f819050919050565b610304836102d1565b610318610310826102f2565b84845461026e565b825550505050565b5f5f905090565b61032f610320565b61033a8184846102fb565b505050565b5b8181101561035d576103525f82610327565b600181019050610340565b5050565b601f8211156103a25761037381610241565b61037c84610253565b8101602085101561038b578190505b61039f61039785610253565b83018261033f565b50505b505050565b5f82821c905092915050565b5f6103c25f19846008026103a7565b1980831691505092915050565b5f6103da83836103b3565b9150826002028217905092915050565b6103f3826101da565b67ffffffffffffffff81111561040c5761040b61006f565b5b6104168254610211565b610421828285610361565b5f60209050601f831160018114610452575f8415610440578287015190505b61044a85826103cf565b8655506104b1565b601f19841661046086610241565b5f5b8281101561048757848901518255600182019150602085019450602081019050610462565b868310156104a457848901516104a0601f8916826103b3565b8355505b6001600288020188555050505b505050505050565b610632806104c65f395ff3fe608060405234801561000f575f5ffd5b5060043610610034575f3560e01c80632e9826021461003857806332af2edb14610054575b5f5ffd5b610052600480360381019061004d9190610260565b610072565b005b61005c610084565b6040516100699190610307565b60405180910390f35b805f9081610080919061052d565b5050565b60605f805461009290610354565b80601f01602080910402602001604051908101604052809291908181526020018280546100be90610354565b80156101095780601f106100e057610100808354040283529160200191610109565b820191905f5260205f20905b8154815290600101906020018083116100ec57829003601f168201915b5050505050905090565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6101728261012c565b810181811067ffffffffffffffff821117156101915761019061013c565b5b80604052505050565b5f6101a3610113565b90506101af8282610169565b919050565b5f67ffffffffffffffff8211156101ce576101cd61013c565b5b6101d78261012c565b9050602081019050919050565b828183375f83830152505050565b5f6102046101ff846101b4565b61019a565b9050828152602081018484840111156102205761021f610128565b5b61022b8482856101e4565b509392505050565b5f82601f83011261024757610246610124565b5b81356102578482602086016101f2565b91505092915050565b5f602082840312156102755761027461011c565b5b5f82013567ffffffffffffffff81111561029257610291610120565b5b61029e84828501610233565b91505092915050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f6102d9826102a7565b6102e381856102b1565b93506102f38185602086016102c1565b6102fc8161012c565b840191505092915050565b5f6020820190508181035f83015261031f81846102cf565b905092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061036b57607f821691505b60208210810361037e5761037d610327565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026103e07fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826103a5565b6103ea86836103a5565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f61042e61042961042484610402565b61040b565b610402565b9050919050565b5f819050919050565b61044783610414565b61045b61045382610435565b8484546103b1565b825550505050565b5f5f905090565b610472610463565b61047d81848461043e565b505050565b5b818110156104a0576104955f8261046a565b600181019050610483565b5050565b601f8211156104e5576104b681610384565b6104bf84610396565b810160208510156104ce578190505b6104e26104da85610396565b830182610482565b50505b505050565b5f82821c905092915050565b5f6105055f19846008026104ea565b1980831691505092915050565b5f61051d83836104f6565b9150826002028217905092915050565b610536826102a7565b67ffffffffffffffff81111561054f5761054e61013c565b5b6105598254610354565b6105648282856104a4565b5f60209050601f831160018114610595575f8415610583578287015190505b61058d8582610512565b8655506105f4565b601f1984166105a386610384565b5f5b828110156105ca578489015182556001820191506020850194506020810190506105a5565b868310156105e757848901516105e3601f8916826104f6565b8355505b6001600288020188555050505b50505050505056fea264697066735822122025903c50ffab7f765c3dd642aa8c4bdfb0bf17bc1b1d90ade9f0e9bfa91230b164736f6c634300081c0033",
}

