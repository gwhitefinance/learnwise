
'use server';

// This is a server-side action. The API key will not be exposed to the client.

export async function searchColleges(query: string) {
    const apiKey = process.env.COLLEGE_SCORECARD_API_KEY;
    if (!apiKey) {
        console.error("College Scorecard API key is not set on the server.");
        return [];
    }

    const fields = 'id,school.name,school.city,school.state';
    const url = `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.name=${encodeURIComponent(query)}&fields=${fields}&per_page=10&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Failed to fetch from College Scorecard API:", error);
        return [];
    }
}
    