async function fetchPortalAccountInfoFcn(url, authorizationHeader) {
	let accountInfo;
	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authorizationHeader,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		accountInfo = await response.json();
	} catch (error) {
		console.error("Error fetching account data:", error);
	}

	return accountInfo;
}
export default fetchPortalAccountInfoFcn;
