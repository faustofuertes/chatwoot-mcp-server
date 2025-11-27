export async function getLead(lead_id: number, kommoCLient: any) {
    try {
        const res = await fetch(`https://${kommoCLient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${lead_id}`, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${kommoCLient.KOMMO_LONG_DURATION_TOKEN}`
            }
        });

        const data = await res.json();

        return data || null;

    } catch (error) {
        console.error("❌ Error en getLead:", error);
        return null;
    }
}

export async function moveLead(lead_id: number, pipeline_id: number, status_id: number, kommoCLient: any) {
    try {
        const res = await fetch(`https://${kommoCLient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${lead_id}`,
            {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${kommoCLient.KOMMO_LONG_DURATION_TOKEN}`
                },
                body: JSON.stringify({
                    pipeline_id: pipeline_id,
                    status_id: status_id
                })
            }
        )

        return res;
    } catch (error) {
        console.error("❌ Error en moveLead:", error);
        return null;
    }
}