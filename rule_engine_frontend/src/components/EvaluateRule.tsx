// src/components/EvaluateRule.tsx
import React, { useState } from 'react';
import { evaluateRule } from '../services/rulesAPI';

const EvaluateRule: React.FC<{ onEvaluate: (result: any) => void }> = ({ onEvaluate }) => {
    const [data, setData] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsedData = JSON.parse(data);
            // console.log(parsedData)
            const result = await evaluateRule(parsedData);
            console.log(result)
            onEvaluate(result); // Handle the evaluation result
        } catch {
            alert('Invalid JSON format');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold mb-4 text-center">Evaluate Rule</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder='Enter data as JSON (e.g., {"ast" : {ast}, "data":{data} })'
                    required
                    className="border p-2 rounded w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded w-full mt-4 transition duration-300 ease-in-out transform hover:scale-105"
                >
                    Evaluate Rule
                </button>
            </form>
        </div>
    );
};

export default EvaluateRule;
