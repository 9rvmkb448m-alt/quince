// Builds the POST request used to transmit a completed Q sort.
//
// Default behaviour is to talk to Baserow directly, which requires the API
// token to live in config.xml - and therefore to be readable by every
// participant in the browser.
//
// When `submitApiUrl` is set in config.xml the app posts to that URL
// *without* an Authorization header instead. That lets the token stay on a
// server (e.g. a Next.js route handler that proxies to Baserow) rather than
// being shipped to participants.
//
// Returns null when the request cannot be built.
const getSubmitRequest = (configObj, results) => {
  const submitApiUrl = (configObj?.submitApiUrl || "").trim();

  if (submitApiUrl) {
    return {
      url: submitApiUrl,
      headers: { "Content-Type": "application/json" },
      data: results,
    };
  }

  const token = configObj?.baserowToken;
  const databaseId = configObj?.baserowDatabaseIdNumber;

  if (token === undefined || token === null) {
    console.log("Baserow token is not set");
    return null;
  }

  if (databaseId === undefined || databaseId === null) {
    console.log("Baserow database id is not set");
    return null;
  }

  return {
    url: `https://api.baserow.io/api/database/rows/table/${databaseId}/?user_field_names=true`,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    data: results,
  };
};

export default getSubmitRequest;
