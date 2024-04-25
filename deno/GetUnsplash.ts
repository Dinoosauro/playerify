/**
 * Create a request with CORS in mind
 * @param body the body of the response
 * @param init extra options for the response
 * @returns A Response, with the headers adjusted for CORS
 */
function webResponse(body: any, init?: ResponseInit) {
    return new Response(body, {
        ...init,
        headers: {
            "Access-Control-Allow-Origin": Deno.env.get("link"), // TODO: Change it with only the production website!
            "Access-Control-Allow-Methods": "GET"
        }
    })
}
Deno.serve(async (req) => {
    if (req.url.substring(req.url.lastIndexOf("/") + 1) === "unsplash") {
        const kv = await Deno.openKv();
        // Add rate limit, since we would be limited by Unsplash API after 50 requests/hour.
        const getPreviousConnections = ((await kv.get(["connections"])).value as number[] ?? []).filter(item => item > Date.now() - 3600000); // Get the request only of the last hour
        kv.set(["connections"], [...getPreviousConnections, Date.now()]); // 
        if (getPreviousConnections.length > 45) return webResponse(JSON.stringify({ error: "Too many requests for Unsplash's API" }), { status: 429 })
        // Get random photo
        const req = await fetch(`https://api.unsplash.com/photos/random/`, {
            headers: {
                Authorization: `Client-ID ${Deno.env.get("unsplash")}`
            }
        });
        if (req.status === 200) {
            const json = await req.json();
            // To comply with Unsplash rules, send the download trigger
            fetch(json.links.download_location, {
                headers: {
                    Authorization: `Client-ID ${Deno.env.get("unsplash")}`
                }

            });
            return webResponse(JSON.stringify({
                description: json.alt_description,
                url: json.urls.full ?? json.urls.raw,
                user: json.user.username,
                userRef: json.user.html,
                imgId: json.id
            }));
        } else return webResponse(JSON.stringify({ error: "Error while fetching data from Unsplash" }), { status: 400 })
    }
    return webResponse(null, { status: 204 });
})