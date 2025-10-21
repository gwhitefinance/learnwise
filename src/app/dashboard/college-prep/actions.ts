
'use server';

import { allUSColleges as hardcodedColleges } from '@/lib/colleges';

type CollegeSearchResult = {
    id: number;
    'school.name': string;
    'school.city': string;
    'school.state': string;
};

type CollegeDetails = {
    id: number;
    'school.name': string;
    'school.city': string;
    'school.state': string;
    'school.school_url': string;
    'latest.student.size': number | null;
    'latest.admissions.admission_rate.overall': number | null;
    'latest.admissions.sat_scores.average.overall': number | null;
    'latest.admissions.act_scores.midpoint.cumulative': number | null;
    'latest.cost.tuition.in_state': number | null;
    'latest.cost.tuition.out_of_state': number | null;
};


const API_BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;

export async function searchColleges(query: string): Promise<CollegeSearchResult[]> {
    if (!API_KEY) {
        console.error("College Scorecard API key is not configured.");
        // Fallback to hardcoded list if API key is missing
        return hardcodedColleges
            .filter(college => college.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 20)
            .map(c => ({
                id: parseInt(c.id, 10),
                'school.name': c.name,
                'school.city': c.location.split(', ')[0],
                'school.state': c.location.split(', ')[1],
            }));
    }

    const fields = 'id,school.name,school.city,school.state';
    const url = `${API_BASE_URL}?api_key=${API_KEY}&school.name=${encodeURIComponent(query)}&fields=${fields}&per_page=20`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Failed to fetch from College Scorecard API:", error);
        return []; // Return empty array on error
    }
}

export async function getCollegeDetails(collegeId: string): Promise<CollegeDetails | null> {
    if (!API_KEY) {
        console.error("College Scorecard API key is not configured.");
        return null;
    }

    const fields = [
        'id',
        'school.name',
        'school.city',
        'school.state',
        'school.school_url',
        'latest.student.size',
        'latest.admissions.admission_rate.overall',
        'latest.admissions.sat_scores.average.overall',
        'latest.admissions.act_scores.midpoint.cumulative',
        'latest.cost.tuition.in_state',
        'latest.cost.tuition.out_of_state',
    ].join(',');

    const url = `${API_BASE_URL}?api_key=${API_KEY}&id=${collegeId}&fields=${fields}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        const result = data.results[0];

        if (!result) return null;
        
        // Ensure all fields exist, providing null if they don't.
        const details: CollegeDetails = {
            id: result.id,
            'school.name': result['school.name'] || 'N/A',
            'school.city': result['school.city'] || 'N/A',
            'school.state': result['school.state'] || 'N/A',
            'school.school_url': result['school.school_url'] || '',
            'latest.student.size': result['latest.student.size'] || null,
            'latest.admissions.admission_rate.overall': result['latest.admissions.admission_rate.overall'] || null,
            'latest.admissions.sat_scores.average.overall': result['latest.admissions.sat_scores.average.overall'] || null,
            'latest.admissions.act_scores.midpoint.cumulative': result['latest.admissions.act_scores.midpoint.cumulative'] || null,
            'latest.cost.tuition.in_state': result['latest.cost.tuition.in_state'] || null,
            'latest.cost.tuition.out_of_state': result['latest.cost.tuition.out_of_state'] || null,
        };

        return details;
        
    } catch (error) {
        console.error(`Failed to fetch details for college ID ${collegeId}:`, error);
        return null;
    }
}
