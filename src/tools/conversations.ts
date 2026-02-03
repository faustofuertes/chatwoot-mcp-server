export async function addTagToConversation(conversation_id: number, labels: string[], chatwootClient: any) {
    try {
        const res = await fetch(`https://crm.chatsappai.com/api/v1/accounts/${chatwootClient.CHATWOOT_ACCOUNT_ID}/conversations/${conversation_id}/labels`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api_access_token": chatwootClient.CHATWOOT_API_ACCESS_TOKEN
            },
            body: JSON.stringify({ labels: labels })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ addTagToConversation failed: HTTP ${res.status} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return data || null;
    } catch (error) {
        console.error(`❌ addTagToConversation failed: ${error}`);
        return null;
    }
}