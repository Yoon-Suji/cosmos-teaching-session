import contractAddress from "./address";

const get_count = async (client, chainId) => {
    const result = await client.queryContractSmart(contractAddress[chainId], {"get_count": {}});
    return result;
}

export default get_count;