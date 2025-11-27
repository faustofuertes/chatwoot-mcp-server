export async function getLead(element_id: number, kommoCLient: any) {
    try {
        const res = await fetch(`https://${kommoCLient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${element_id}`, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${kommoCLient.KOMMO_LONG_DURATION_TOKEN}`
            }
        });

        const data = await res.json();

        return data || null;

    } catch (error) {
        console.error("❌ Error en getLead (kommo.service.js):", error);
        return null;
    }
}