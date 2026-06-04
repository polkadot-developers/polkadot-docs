await store.set("network", "paseo");

const network = await store.get("network");

if (network === null) {
    console.log("Key not found");
} else {
    console.log("Network:", network);
}
