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
        console.error("❌ getLead failed: unexpected error during lead retrieval.", error);
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
        console.error("❌ moveLead failed: unable to update pipeline or status for the specified lead.", error);
        return null;
    }
}

export async function pauseLeadAgent(lead_id: number, kommoClient: any) {
    try {
        const res = await fetch(`https://${kommoClient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${lead_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${kommoClient.KOMMO_LONG_DURATION_TOKEN}`
            },
            body: JSON.stringify({
                custom_fields_values: [
                    {
                        field_id: 1493142,
                        values: [
                            { value: true }
                        ]
                    }
                ]
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("❌ pauseLeadAgent failed: Kommo responded with an error.", errText);
            return null;
        }

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("❌ pauseLeadAgent failed: unexpected error while updating the lead.", error);
        return null;
    }
}