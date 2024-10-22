// src/services/rulesApi.ts
const BASE_URL = 'http://127.0.0.1:8000/rules'; // Replace with your actual API base URL

export const createRule = async (rule: string): Promise<any> => {

    const response = await fetch(`${BASE_URL}/create-rule/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rule }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }


    const res_data = await response.json()
    return res_data;
};

export const combineRules = async (rules: string[]): Promise<any> => {
    const response = await fetch(`${BASE_URL}/combine-rules/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }

    const res_data = await response.json()
    return res_data;
};

export const evaluateRule = async (data: object): Promise<any> => {
    const response = await fetch(`${BASE_URL}/evaluate-rule/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }

    const res_data = await response.json()
    return res_data;
};

export const fetchRules = async (): Promise<any> => {
    const response = await fetch(`${BASE_URL}/all-rules/`, {
        method: 'GET',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }

    const res_data = await response.json()
    return res_data;
};

export const modifyRule = async (ruleId: string, newRule: string) => {

    const response = await fetch(`${BASE_URL}/modify-rule/${ruleId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_rule: newRule }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }

    const res_data = await response.json()
    return res_data;
};

